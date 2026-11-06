#!/usr/bin/env python3

import os
import site
import sys

# Ensure site-packages for the currently running Python version are available.
# This avoids importing binary wheels from a different Python version.
python_version = f"Python{sys.version_info.major}{sys.version_info.minor}"
candidate_paths = [
    os.path.expanduser(fr"~\\AppData\\Roaming\\Python\\{python_version}\\site-packages"),
    os.path.expanduser(
        fr"~\\AppData\\Local\\Programs\\Python\\{python_version}\\Lib\\site-packages"
    ),
    *site.getsitepackages(),
]
for extra_path in candidate_paths:
    if extra_path and extra_path not in sys.path and os.path.isdir(extra_path):
        sys.path.append(extra_path)

import requests
from flask import Flask, request, jsonify, send_from_directory, send_file, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.exceptions import HTTPException, NotFound
try:
    from PIL import Image  # type: ignore
except Exception as pil_error:  # Pillow may be missing native binaries on this Python
    Image = None  # type: ignore
    print(f"[WARNING] Pillow (PIL) not fully available: {pil_error}. Image-based diagnosis endpoints will be limited.")
import base64
import io
import json
import uuid
from typing import Dict, List, Any, Optional

# Gemini client (google-generativeai) is optional in this local Windows setup
try:
    import google.generativeai as genai  # type: ignore
except Exception as genai_error:
    genai = None  # type: ignore
    print(f"[WARNING] google-generativeai not fully available: {genai_error}. Gemini chat/diagnosis will be disabled.")
from datetime import datetime
from dotenv import load_dotenv

# Replicate (voice TTS) is optional; may not work on this local Python
try:
    import replicate  # type: ignore
except Exception as replicate_error:
    replicate = None  # type: ignore
    print(f"[WARNING] Replicate client not available: {replicate_error}. Voice TTS endpoints will be disabled.")

# Ensure project root is on sys.path so 'backend.*' imports work when run directly
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
from backend.supabase_db import (
    create_user,
    get_user_by_id,
    get_user_by_email,
    update_user_profile,
    create_diagnosis,
    get_user_diagnoses,
    create_user_activity,
    test_connection,
    is_database_available,
    create_tables,
)
from backend.auth_utils import require_auth, optional_auth, initialize_supabase
from backend.auth_endpoints import auth_bp

# Load environment variables from .env file
import os
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_PATH = os.path.join(PROJECT_ROOT, '.env')
load_dotenv(dotenv_path=ENV_PATH, override=True)

# Debug: Print loaded environment variables (remove in production)
print(f"[INFO] Loading .env from: {ENV_PATH}")
gemini_debug = os.getenv('GEMINI_API_KEY')
replicate_debug = os.getenv('REPLICATE_API_TOKEN')
print(f"[INFO] Gemini key loaded: {'Yes' if gemini_debug and len(gemini_debug) > 10 else 'No'}")
print(f"[INFO] Replicate token loaded: {'Yes' if replicate_debug and len(replicate_debug) > 10 else 'No'}")

# Determine database availability (Supabase/Postgres) via DATABASE_URL in .env
DATABASE_AVAILABLE = is_database_available()
print(f"[INFO] Database available: {DATABASE_AVAILABLE}")

app = Flask(__name__)

# Register authentication blueprint
app.register_blueprint(auth_bp)

# Initialize Supabase authentication
initialize_supabase()

# Configure CORS based on environment
if os.environ.get('FLASK_ENV') == 'production':
    # In production, restrict CORS to specific origins
    cors_origins = os.environ.get('CORS_ORIGINS', 'https://*.replit.dev')
    allowed_origins = cors_origins.split(',')
    CORS(app, origins=allowed_origins, allow_headers=['Content-Type'], methods=['GET', 'POST', 'OPTIONS'])
else:
    # In development, allow all origins
    CORS(app, origins=['*'], allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'])

# Upload limits for the public diagnosis endpoints
MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 50_000_000  # A small file can still expand to a huge image in memory
ALLOWED_IMAGE_FORMATS = ['JPEG', 'PNG', 'WEBP']
AI_RATE_LIMIT = "20 per minute;200 per hour"  # Per IP, for every endpoint that uses the models

# Base64 in JSON uploads adds about a third to the size of the image
app.config['MAX_CONTENT_LENGTH'] = MAX_IMAGE_BYTES * 4 // 3 + 64 * 1024

limiter = Limiter(get_remote_address, app=app, storage_uri="memory://")

@app.errorhandler(413)
def request_too_large(error):
    return jsonify({"success": False, "error": "Image is larger than 5 MB"}), 413

@app.errorhandler(429)
def too_many_requests(error):
    return jsonify({"success": False, "error": "Too many requests. Please wait a minute and try again."}), 429

# Hugging Face model configuration - SIMPLIFIED APPROACH
MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
HF_TOKEN = os.environ.get('HF_TOKEN')
DISABLE_HF_MODEL = os.environ.get('DISABLE_HF_MODEL', '').lower() in ('1', 'true', 'yes')

# Local Keras model (.h5). When a trained file is present it takes priority over HuggingFace.
PLANT_MODEL_PATH = os.environ.get(
    'PLANT_MODEL_PATH',
    os.path.join(CURRENT_DIR, 'models', 'plantvillage_mobilenetv2.h5')
)
local_plant_model = None

if os.path.exists(PLANT_MODEL_PATH):
    try:
        from backend.plant_model import PlantDiseaseModel

        local_plant_model = PlantDiseaseModel(PLANT_MODEL_PATH)
        print(f"[OK] Local plant disease model loaded: {PLANT_MODEL_PATH}")
    except Exception as e:
        print(f"[ERROR] Not using local plant model {PLANT_MODEL_PATH}: {e}")

# Below this confidence a prediction is treated as a guess, not a diagnosis. Images
# outside the 38 trained classes (other crops, non-plants) still get a top label,
# and in testing none of them scored above 0.71.
PLANT_CONFIDENCE_THRESHOLD = 0.75

# Simple direct model loading with fallback
pipe = None
use_gemini_fallback = False

try:
    if local_plant_model is not None:
        raise Exception("Local plant model in use")

    if DISABLE_HF_MODEL:
        print("[INFO] DISABLE_HF_MODEL enabled - skipping HuggingFace model initialization")
        use_gemini_fallback = True
        raise Exception("HF model initialization disabled by environment")

    # Lazy-import transformers so that failures (e.g. low RAM / Torch DLL issues)
    # don't crash the whole backend. If this import fails, we gracefully
    # fall back to Gemini-only plant diagnosis.
    from transformers import pipeline  # type: ignore

    print(f"[INFO] Loading HuggingFace model: {MODEL_NAME}")

    # The model is public, so a token is optional. A placeholder from .env.example would be rejected.
    has_real_token = HF_TOKEN and not HF_TOKEN.startswith('your_')

    # Direct pipeline approach - much simpler
    pipe = pipeline(
        "image-classification",
        model=MODEL_NAME,
        token=HF_TOKEN if has_real_token else None,
        device=-1
    )
    
    print("[OK] HuggingFace model loaded successfully!")
    
except Exception as e:
    print(f"[ERROR] Model loading failed or Transformers unavailable: {e}")
    if not use_gemini_fallback:
        use_gemini_fallback = True
        print("[INFO] Falling back to Gemini AI for plant diagnosis only (no local HF model)")
    pipe = None

# Gemini AI client setup for chat functionality (optional)
gemini_api_key = os.getenv('GEMINI_API_KEY')  # Only use Gemini API key
gemini_model = None
# The client's default is to retry for minutes, which would hang the request
GEMINI_REQUEST_OPTIONS = {'timeout': 20, 'retry': None}
if genai is None:
    print("[INFO] google-generativeai not available; Gemini features are disabled.")
else:
    try:
        if gemini_api_key and gemini_api_key != 'your-gemini-api-key-here':
            genai.configure(api_key=gemini_api_key)
            # Creating the model object does not contact Google, so a retired
            # model name only fails on the first real request
            gemini_model_name = os.getenv('GEMINI_MODEL', 'gemini-3.5-flash')
            gemini_model = genai.GenerativeModel(gemini_model_name)
            print(f"[OK] Gemini AI client initialized successfully ({gemini_model_name})")
        else:
            print("Warning: No valid Gemini API key provided - using fallback responses")
    except Exception as e:
        print(f"Warning: Could not initialize Gemini client: {e}")
        gemini_model = None

# Replicate API setup for text-to-speech (optional)
replicate_api_token = os.getenv('REPLICATE_API_TOKEN')
if replicate is None:
    print("[INFO] Replicate package not available; voice TTS will use fallback.")
else:
    try:
        if replicate_api_token and replicate_api_token != 'your-replicate-token-here':
            print("[OK] Replicate API token found - voice functionality enabled")
        else:
            print("Warning: No valid Replicate API token provided - voice functionality will use fallback")
    except Exception as e:
        print(f"Warning: Could not initialize Replicate client: {e}")

# S3 storage for uploaded plant photos (optional, enabled by setting S3_BUCKET)
S3_BUCKET = os.environ.get('S3_BUCKET')
s3_client = None
if S3_BUCKET:
    try:
        import boto3
        from botocore.config import Config

        # Short timeouts so a storage problem cannot hold up a diagnosis
        s3_client = boto3.client('s3', config=Config(connect_timeout=3, read_timeout=10, retries={'max_attempts': 1}))
        print(f"[OK] Plant photos will be saved to S3 bucket: {S3_BUCKET}")
    except Exception as e:
        print(f"[WARNING] S3 not available: {e}")

# System prompt for the farming assistant
FARMING_SYSTEM_PROMPT = """You are Kisan Mitra AI, a knowledgeable and friendly AI farming assistant specifically designed to help farmers in India. Your role is to provide practical, accurate, and culturally relevant agricultural advice.

Key guidelines:
1. Always respond in a warm, respectful tone using simple language
2. Provide practical, actionable advice for Indian farming conditions
3. Consider local crops, climate, and farming practices
4. Include seasonal considerations when relevant
5. Mention organic/sustainable practices when appropriate
6. If asked about medical issues with plants, provide treatment options
7. Keep responses concise but comprehensive
8. Use Hindi/local language terms when helpful, with English explanations
9. Always prioritize farmer safety and sustainable practices

You can help with:
- Crop cultivation advice
- Pest and disease management
- Soil health and fertilizers
- Weather-related farming decisions
- Market prices and selling strategies
- Irrigation and water management
- Organic farming methods
- Seasonal planning
- Equipment and tools guidance

Remember: You are a helpful friend to the farmer, not just an information source."""

headers = {"Authorization": f"Bearer {HF_TOKEN}"}

# Initialize database on startup
def initialize_database():
    """Initialize database (create tables if DB available)."""
    try:
        if DATABASE_AVAILABLE:
            created = create_tables()
            print("[OK] Database tables ready" if created else "[WARNING] Database tables check failed or already exist")
            return True
        else:
            print("[WARNING] Database not configured. Set DATABASE_URL in .env to enable DB features.")
            return False
    except Exception as e:
        print(f"[ERROR] Database initialization error: {e}")
        return False

# Initialize database when the module loads
DB_INITIALIZED = initialize_database()

def query_huggingface_model(image: Image.Image) -> Dict[str, Any]:
    """
    Process image using the HuggingFace model - simplified approach
    """
    global pipe
    
    if pipe is None:
        print("[ERROR] Model not loaded")
        raise Exception("Model not available")
    
    try:
        # Ensure proper image format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        print("[INFO] Processing with HuggingFace model...")
        
        # Get predictions
        predictions = pipe(image)
        
        print(f"[OK] Got {len(predictions)} predictions")
        if predictions:
            print(f"[OK] Top: {predictions[0]['label']} ({predictions[0]['score']:.3f})")
        
        return predictions
        
    except Exception as e:
        print(f"[ERROR] Processing failed: {e}")
        raise Exception(f"Model error: {str(e)}")

def predict_plant_disease(image: Image.Image) -> tuple:
    """
    Run the available plant disease model.
    Returns (predictions, model_used), with predictions as [{"label", "score"}]
    """
    if local_plant_model is not None:
        return local_plant_model.predict(image), "keras_h5"
    return query_huggingface_model(image), "huggingface_transformer"

def save_plant_image_to_s3(image: Image.Image) -> Optional[str]:
    """
    Store an uploaded photo in S3 without ever failing the diagnosis.
    Returns the object key, or None if it was not stored
    """
    if s3_client is None:
        return None

    try:
        img_byte_arr = io.BytesIO()
        image.convert('RGB').save(img_byte_arr, format='JPEG', quality=90)
        key = f"diagnoses/{datetime.utcnow():%Y/%m/%d}/{uuid.uuid4().hex}.jpg"
        s3_client.put_object(Bucket=S3_BUCKET, Key=key, Body=img_byte_arr.getvalue(), ContentType='image/jpeg')
        return key
    except Exception as e:
        print(f"[WARNING] Could not save image to S3: {e}")
        return None

class InvalidImageError(Exception):
    """An uploaded file was rejected. The message is safe to show to the user."""

def open_uploaded_image(image_bytes: bytes) -> Image.Image:
    """
    Validate an uploaded file by its actual contents, not its name or declared type
    """
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise InvalidImageError("Image is larger than 5 MB")

    invalid_format = "Only JPEG, PNG and WebP images are allowed"
    try:
        image = Image.open(io.BytesIO(image_bytes), formats=ALLOWED_IMAGE_FORMATS)
    except Exception:
        raise InvalidImageError(invalid_format)

    if image.size[0] * image.size[1] > MAX_IMAGE_PIXELS:
        raise InvalidImageError("Image dimensions are too large")

    try:
        image.load()
    except Exception:
        raise InvalidImageError(invalid_format)
    return image

def process_base64_image(base64_data: str) -> bytes:
    """
    Process base64 encoded image for MobileNetV2 224x224 model
    """
    try:
        # Remove data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_data)
        
        # Open and process the image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # CRITICAL: Resize to exactly 224x224 for MobileNetV2 model
        # This model expects 224x224 input images
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to bytes with high quality
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG', quality=95)
        return img_byte_arr.getvalue()
        
    except Exception as e:
        raise Exception(f"Error processing base64 image: {str(e)}")

def get_disease_with_highest_probability(predictions: Any) -> Dict[str, Any]:
    """
    Extract the disease with highest probability from predictions
    """
    # Handle different response formats from HuggingFace API
    if isinstance(predictions, dict):
        if 'error' in predictions:
            return {"error": predictions['error']}
        # If it's a single prediction dict, convert to list
        predictions = [predictions]
    
    if not predictions or not isinstance(predictions, list):
        return {"error": "No valid predictions received"}
    
    # Sort by score so the first prediction is the most likely one
    ranked = sorted(predictions, key=lambda x: x.get('score', 0), reverse=True)
    disease_name = ranked[0].get('label', 'Unknown Disease')
    top_score = ranked[0].get('score', 0)

    all_predictions = [
        {"disease": p.get('label', 'Unknown Disease'), "confidence": round(p.get('score', 0) * 100, 1)}
        for p in ranked[:3]
    ]

    if top_score < PLANT_CONFIDENCE_THRESHOLD:
        return {
            "disease": "Could Not Identify",
            "confidence": all_predictions[0]["confidence"],
            "status": "uncertain",
            "is_healthy": False,
            "message": "This photo does not clearly match a crop disease we know. Retake a close, well-lit photo of a single leaf. We can identify 14 crops, including tomato, potato, corn, grape and apple.",
            "all_predictions": all_predictions
        }

    # Determine if healthy or not based on label
    is_healthy = 'healthy' in disease_name.lower()

    return {
        "disease": disease_name,
        "confidence": all_predictions[0]["confidence"],
        "status": "healthy" if is_healthy else "not_healthy",
        "is_healthy": is_healthy,
        "all_predictions": all_predictions
    }

def diagnose_with_gemini(image: Image.Image) -> Dict[str, Any]:
    """
    Use Gemini AI to analyze plant images for disease detection
    """
    if not gemini_model:
        raise Exception("Gemini AI not available")
    
    try:
        # Convert PIL image to bytes for Gemini
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr.seek(0)
        
        # Prepare the prompt for plant disease analysis
        prompt = """
        You are an expert plant pathologist. Analyze this plant image and identify any diseases or health issues.
        
        Please provide your analysis in the following JSON format:
        {
            "is_plant": true,
            "disease": "Disease name or 'Healthy Plant' if no issues found",
            "confidence": 85,
            "is_healthy": false,
            "status": "not_healthy",
            "description": "Brief description of the condition",
            "severity": "low/medium/high",
            "affected_area": "Description of affected plant parts"
        }
        
        Focus on:
        - Leaf spots, discoloration, or unusual patterns
        - Wilting, browning, or yellowing
        - Fungal growth or mold
        - Insect damage or pest signs
        - Overall plant health
        
        If the plant appears healthy, set is_healthy to true and status to "healthy".

        Set is_plant to false if the image does not show a close enough view of a plant's
        leaves, stem or fruit to judge its health, for example a person, a logo, a graphic,
        or a wide view of a field.
        """
        
        # Upload image and get analysis
        response = gemini_model.generate_content([prompt, image], request_options=GEMINI_REQUEST_OPTIONS)
        
        # Parse the response
        response_text = response.text.strip()
        
        # Try to extract JSON from the response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                
                # Ensure required fields are present
                if 'disease' not in result:
                    result['disease'] = 'Unknown Disease'
                if 'confidence' not in result:
                    result['confidence'] = 75
                if 'is_healthy' not in result:
                    result['is_healthy'] = False
                if 'status' not in result:
                    result['status'] = 'not_healthy' if not result['is_healthy'] else 'healthy'
                
                # Add all_predictions for compatibility
                result['all_predictions'] = [
                    {"disease": result['disease'], "confidence": result['confidence']}
                ]
                
                return result
                
            except json.JSONDecodeError:
                pass
        
        # Fallback parsing if JSON extraction fails
        disease_name = "Plant Health Issue Detected"
        is_healthy = "healthy" in response_text.lower() or "no disease" in response_text.lower()
        
        if is_healthy:
            disease_name = "Healthy Plant"
        
        return {
            "disease": disease_name,
            "confidence": 80,
            "is_healthy": is_healthy,
            "status": "healthy" if is_healthy else "not_healthy",
            "description": response_text[:200] + "..." if len(response_text) > 200 else response_text,
            "all_predictions": [{"disease": disease_name, "confidence": 80}]
        }
        
    except Exception as e:
        print(f"Gemini AI analysis error: {str(e)}")
        raise Exception(f"Gemini AI analysis failed: {str(e)}")

def get_demo_disease_result() -> Dict[str, Any]:
    """
    Fallback when model fails
    """
    print("[ERROR] Using fallback - model not available")
    
    return {
        "disease": "Model Unavailable",
        "confidence": 0,
        "status": "error",
        "is_healthy": False,
        "error": "Plant disease model not loaded",
        "all_predictions": []
    }

def save_diagnosis_to_db(user_id: int, crop_name: str, diagnosis: str, confidence: int, treatment: str):
    """Save diagnosis result to database"""
    if not DB_INITIALIZED or not DATABASE_AVAILABLE:
        print("Database not available - skipping diagnosis save")
        return None
        
    try:
        db = get_db_session()
        diagnosis_record = create_diagnosis(
            db=db, 
            user_id=user_id,
            crop_name=crop_name,
            diagnosis=diagnosis,
            confidence=confidence,
            treatment=treatment,
            date=datetime.utcnow()
        )
        
        # Log the diagnosis activity
        create_user_activity(
            db=db,
            user_id=user_id,
            action="plant_diagnosis",
            data={
                "diagnosis_id": diagnosis_record.id,
                "crop_name": crop_name,
                "diagnosis": diagnosis,
                "confidence": confidence
            }
        )
        
        db.close()
        print(f"[OK] Diagnosis saved to database with ID: {diagnosis_record.id}")
        return diagnosis_record
        
    except Exception as e:
        print(f"[ERROR] Error saving diagnosis to database: {e}")
        return None

def get_treatment_recommendation(disease_name: str) -> str:
    """Generate treatment recommendation based on disease"""
    # Basic treatment recommendations based on common diseases
    treatments = {
        "late blight": "Apply copper-based fungicides. Remove affected leaves. Improve air circulation. Avoid overhead watering.",
        "early blight": "Use fungicides containing chlorothalonil. Practice crop rotation. Remove plant debris after harvest.",
        "powdery mildew": "Apply sulfur or neem oil. Increase air circulation. Avoid overhead watering. Remove affected parts.",
        "bacterial spot": "Use copper-based bactericides. Avoid overhead irrigation. Practice crop rotation. Remove infected plants.",
        "mosaic virus": "Remove infected plants immediately. Control aphid vectors. Use virus-resistant varieties.",
        "rust": "Apply fungicides with propiconazole. Improve air circulation. Avoid overhead watering.",
        "black rot": "Use copper-based fungicides. Practice crop rotation. Remove infected plant parts promptly.",
        "scab": "Apply fungicides during wet weather. Improve air circulation. Remove fallen leaves.",
        "healthy": "Plant appears healthy. Continue current care practices. Monitor regularly for any changes."
    }
    
    # Find matching treatment
    disease_lower = disease_name.lower()
    for key, treatment in treatments.items():
        if key in disease_lower:
            return treatment
    
    # Default treatment advice
    return "Consult with a local agricultural expert for specific treatment recommendations. Monitor the plant closely and remove any affected parts."

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with live database connectivity probe"""
    # Get live database status instead of using stale module-level flag
    if DATABASE_AVAILABLE:
        try:
            db_connected = test_connection()
            db_status = "connected" if db_connected else "connection_failed"
        except Exception as e:
            db_status = f"error: {str(e)}"
    else:
        db_status = "not_available"
    
    return jsonify({
        "status": "healthy", 
        "message": "Plant Diagnosis API is running",
        "database": db_status,
        "database_live_test": True  # Indicates this is a live test, not cached
    })

@app.route('/health', methods=['GET'])
def health_check_root():
    """Health check endpoint at root for deployment health checks"""
    return jsonify({"status": "healthy", "message": "Plant Diagnosis API is running"})

@app.route('/api/diagnose', methods=['POST'])
@limiter.limit(AI_RATE_LIMIT)
def diagnose_plant():
    """
    Main endpoint for plant disease diagnosis
    Accepts either:
    1. JSON with base64_image
    2. Form data with file upload
    3. Direct image file upload
    """
    try:
        # Use authenticated user ID from Supabase Auth
        user_id = None  # UUID from Supabase Auth
        image = None
        crop_name = 'Unknown Crop'
        
        # Handle different input formats
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle file upload
            if 'file' not in request.files:
                return jsonify({"error": "No file uploaded"}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            
            crop_name = request.form.get('crop_name', 'Unknown Crop')
            image = open_uploaded_image(file.read())

        else:
            # Handle JSON data
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            crop_name = data.get('crop_name', 'Unknown Crop')
            
            # Process base64 image
            if 'base64_image' in data or 'image_data' in data:
                base64_data = data.get('base64_image') or data.get('image_data')
                if not base64_data:
                    return jsonify({"error": "base64_image cannot be empty"}), 400
                if ',' in base64_data:
                    base64_data = base64_data.split(',')[1]
                try:
                    img_bytes = base64.b64decode(base64_data)
                except ValueError:
                    raise InvalidImageError("Only JPEG, PNG and WebP images are allowed")
                image = open_uploaded_image(img_bytes)
            else:
                return jsonify({"error": "Either base64_image or file upload must be provided"}), 400
        
        if image is None:
            return jsonify({"error": "Could not process image"}), 400

        # Save the original photo before it is resized for the model
        image_key = save_plant_image_to_s3(image)

        # Ensure image is in RGB and resize to 224x224 for MobileNetV2
        if image.mode != 'RGB':
            image = image.convert('RGB')
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Run prediction using the local .h5 model or the HuggingFace pipeline
        result = None
        try:
            predictions, model_used = predict_plant_disease(image)
            result = get_disease_with_highest_probability(predictions)
            result['model_used'] = model_used
        except Exception as model_error:
            print(f"[INFO] Model failed: {model_error}")

        # Gemini can also handle crops outside the model's 38 classes
        if result is None or result.get('status') == 'uncertain':
            try:
                gemini_result = diagnose_with_gemini(image)
                if gemini_result.get('is_plant') is not False:
                    gemini_result['model_used'] = "gemini_ai"
                    result = gemini_result
                    print("[OK] Gemini AI diagnosis successful")
            except Exception as gemini_error:
                print(f"[INFO] Gemini AI not used: {gemini_error}")

        if result is None:
            # Use demo result as last resort
            result = get_demo_disease_result()
            result['model_used'] = "demo_mode"

        # Generate treatment recommendation
        treatment = get_treatment_recommendation(result.get('disease', ''))
        result['treatment'] = treatment

        if image_key:
            result['image_key'] = image_key

        # Save to database if user_id is provided
        diagnosis_record = None
        if user_id and DB_INITIALIZED:
            diagnosis_record = save_diagnosis_to_db(
                user_id=user_id,
                crop_name=crop_name,
                diagnosis=result.get('disease', ''),
                confidence=result.get('confidence', 0),
                treatment=treatment
            )
            
            if diagnosis_record:
                result['diagnosis_id'] = diagnosis_record.id
                result['saved_to_db'] = True
            else:
                result['saved_to_db'] = False
        
        return jsonify({
            "success": True,
            "result": result
        })

    except InvalidImageError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /diagnose endpoint: {str(e)}")
        # Provide demo result instead of error
        demo_result = get_demo_disease_result()
        demo_result['treatment'] = get_treatment_recommendation(demo_result.get('disease', ''))
        return jsonify({
            "success": True,
            "result": demo_result,
            "note": "Demo mode - AI service temporarily unavailable"
        })

@app.route('/api/diagnose/upload', methods=['POST'])
@limiter.limit(AI_RATE_LIMIT)
@require_auth
def diagnose_uploaded_file():
    """
    Endpoint for direct file upload
    Optional form data: user_id and crop_name for database storage
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Use authenticated user ID from Supabase Auth
        user_id = g.user_id  # UUID from Supabase Auth
        crop_name = request.form.get('crop_name', 'Unknown Crop')
        
        # Read and process the uploaded file
        image = open_uploaded_image(file.read())
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image if too large
        max_size = (1024, 1024)
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG', quality=85)
        image_bytes = img_byte_arr.getvalue()
        
        # Process image with the local model
        predictions, _ = predict_plant_disease(image)
        
        # Process results
        if not predictions:
            raise Exception("No predictions returned from the model")
            
        # Get the prediction with highest score
        top_prediction = max(predictions, key=lambda x: x['score'])
        result = {
            'disease': top_prediction['label'],
            'confidence': round(float(top_prediction['score']) * 100, 2)
        }
        
        # Generate treatment recommendation
        treatment = get_treatment_recommendation(result.get('disease', ''))
        result['treatment'] = treatment
        
        # Save to database if user_id is provided
        diagnosis_record = None
        if user_id and DB_INITIALIZED:
            diagnosis_record = save_diagnosis_to_db(
                user_id=user_id,
                crop_name=crop_name,
                diagnosis=result.get('disease', ''),
                confidence=result.get('confidence', 0),
                treatment=treatment
            )
            
            if diagnosis_record:
                result['diagnosis_id'] = diagnosis_record.id
                result['saved_to_db'] = True
            else:
                result['saved_to_db'] = False
        
        return jsonify({
            "success": True,
            "result": result
        })
        
    except InvalidImageError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /diagnose/upload endpoint: {str(e)}")
        # Provide demo result instead of error
        demo_result = get_demo_disease_result()
        demo_result['treatment'] = get_treatment_recommendation(demo_result.get('disease', ''))
        return jsonify({
            "success": False,
            "error": str(e),
            "result": demo_result,
            "note": "Error occurred. Showing demo results."
        })

# User Management API endpoints
@app.route('/api/users', methods=['POST'])
def create_user_endpoint():
    """Create a new user"""
    try:
        if not DB_INITIALIZED or not DATABASE_AVAILABLE:
            return jsonify({"error": "Database not available"}), 503
            
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate required fields
        required_fields = ['name', 'phone', 'location', 'state']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({"error": f"{field} is required"}), 400
        
        db = get_db_session()
        
        # Check if user with this phone already exists
        existing_user = get_user_by_phone(db, data['phone'])
        if existing_user:
            db.close()
            return jsonify({
                "success": True,
                "user": existing_user.to_dict(),
                "message": "User already exists"
            })
        
        # Create new user
        user = create_user(
            db=db,
            name=data['name'].strip(),
            phone=data['phone'].strip(),
            location=data['location'].strip(),
            state=data['state'].strip(),
            avatar=data.get('avatar')
        )
        
        # Log user registration activity
        create_user_activity(
            db=db,
            user_id=user.id,
            action="user_registered",
            data={
                "registration_method": "api",
                "location": user.location,
                "state": user.state
            }
        )
        
        db.close()
        
        return jsonify({
            "success": True,
            "user": user.to_dict(),
            "message": "User created successfully"
        })
        
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_endpoint(user_id):
    """Get user information by ID"""
    try:
        if not DB_INITIALIZED or not DATABASE_AVAILABLE:
            return jsonify({"error": "Database not available"}), 503
            
        db = get_db_session()
        user = get_user_by_id(db, user_id)
        
        if not user:
            db.close()
            return jsonify({"error": "User not found"}), 404
        
        db.close()
        return jsonify({
            "success": True,
            "user": user.to_dict()
        })
        
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/users/phone/<phone>', methods=['GET'])
def get_user_by_phone_endpoint(phone):
    """Get user information by phone number"""
    try:
        if not DB_INITIALIZED or not DATABASE_AVAILABLE:
            return jsonify({"error": "Database not available"}), 503
            
        db = get_db_session()
        user = get_user_by_phone(db, phone)
        
        if not user:
            db.close()
            return jsonify({"error": "User not found"}), 404
        
        db.close()
        return jsonify({
            "success": True,
            "user": user.to_dict()
        })
        
    except Exception as e:
        print(f"Error getting user by phone: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/diagnoses', methods=['GET'])
@require_auth
def get_user_diagnoses_endpoint():
    """Get diagnosis history for authenticated user"""
    try:
        from backend.supabase_db import get_user_diagnoses
        diagnoses = get_user_diagnoses(g.user_id)
        return jsonify({
            "success": True,
            "diagnoses": diagnoses or []
        })
    except Exception as e:
        print(f"Error getting user diagnoses: {str(e)}")
        # Return empty list instead of error for better UX
        return jsonify({
            "success": True,
            "diagnoses": [],
            "note": "No diagnoses found or database temporarily unavailable"
        })

@app.route('/api/users/<int:user_id>/diagnoses', methods=['GET'])
def get_user_diagnoses_by_id(user_id):
    """Get diagnosis history for a user"""
    try:
        if not DB_INITIALIZED or not DATABASE_AVAILABLE:
            return jsonify({"error": "Database not available"}), 503
            
        # Get optional limit parameter
        limit = request.args.get('limit', 50, type=int)
        if limit > 100:  # Cap at 100 for performance
            limit = 100
            
        db = get_db_session()
        
        # Check if user exists
        user = get_user_by_id(db, user_id)
        if not user:
            db.close()
            return jsonify({"error": "User not found"}), 404
        
        # Get user diagnoses
        diagnoses = get_user_diagnoses(db, user_id, limit)
        
        diagnoses_data = [diagnosis.to_dict() for diagnosis in diagnoses]
        
        db.close()
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "diagnoses": diagnoses_data,
            "count": len(diagnoses_data)
        })
        
    except Exception as e:
        print(f"Error getting user diagnoses: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Chat API endpoint
@app.route('/api/chat', methods=['POST'])
@limiter.limit(AI_RATE_LIMIT)
@optional_auth
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not gemini_model:
            print("[WARNING] gemini_model is None - model not initialized")
            # Provide a helpful fallback response when Gemini is not configured
            return jsonify({
                'response': "Hello! I'm Kisan Mitra AI, your farming assistant. I can help you with crop cultivation, pest management, soil health, and other farming questions. However, I need proper API configuration to provide detailed responses. Please ask me about specific farming topics!",
                'timestamp': datetime.now().isoformat()
            })
        
        print(f"[INFO] Using gemini_model for chat: {type(gemini_model)}")
        # Create chat completion with Gemini
        full_prompt = f"{FARMING_SYSTEM_PROMPT}\n\nUser: {user_message}\n\nKisan Mitra AI:"
        print(f"[INFO] Sending prompt to Gemini (length: {len(full_prompt)})")
        response = gemini_model.generate_content(full_prompt, request_options=GEMINI_REQUEST_OPTIONS)
        print(f"[INFO] Received response from Gemini")
        
        bot_response = response.text.strip()
        
        # Log the conversation for debugging
        print(f"[{datetime.now()}] User: {user_message}")
        print(f"[{datetime.now()}] Bot: {bot_response}")
        
        return jsonify({
            'response': bot_response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        error_str = str(e).lower()
        error_msg = str(e)
        print(f"[ERROR] Chat endpoint error: {error_msg}")
        print(f"[ERROR] Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
        # Provide helpful fallback response with error details for debugging
        return jsonify({
            'response': f"I'm experiencing some technical difficulties right now. Error: {error_msg[:100]}. As your farming assistant, I'm here to help with questions about crops, soil, pests, irrigation, and sustainable farming practices. Could you please try asking your question again?",
            'timestamp': datetime.now().isoformat(),
            'error': error_msg
        })

# Voice Assistant API endpoints
@app.route('/api/voice/tts', methods=['POST'])
@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech using Replicate API"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        language = data.get('language', 'en')  # Default to English
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Limit text length for performance
        if len(text) > 1000:
            text = text[:1000] + "..."
        
        # Check if Replicate API token is available
        if not replicate_api_token or replicate is None:
            return jsonify({
                'error': 'Voice functionality not available',
                'fallback': True,
                'message': 'Please configure REPLICATE_API_TOKEN for voice support'
            }), 503
        
        try:
            if replicate is None:
                raise Exception("Replicate client not available in this environment")
            # Use CosyVoice2 model for high-quality multilingual TTS
            output = replicate.run(
                "iic/cosyvoice2-0.5b:8cd0f4b6ae0d3e5aff0fa0f9ccedb97d8f58a1df5ab4ff91b6be2d3d3e3b68e",
                input={
                    "text": text,
                    "voice": "中文女",  # Chinese female voice that handles multilingual well
                    "language": "auto"  # Auto-detect language
                }
            )
            
            # Return the audio URL
            if output and len(output) > 0:
                audio_url = output[0] if isinstance(output, list) else output
                return jsonify({
                    'success': True,
                    'audio_url': audio_url,
                    'text': text,
                    'language': language
                })
            else:
                raise Exception("No audio output received")
                
        except Exception as replicate_error:
            print(f"Replicate TTS error: {str(replicate_error)}")
            # Return fallback response - let frontend handle browser TTS
            return jsonify({
                'success': False,
                'fallback': True,
                'text': text,
                'error': 'Voice generation temporarily unavailable'
            })
        
    except Exception as e:
        print(f"Error in text-to-speech endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'fallback': True,
            'error': str(e)
        }), 500

@app.route('/api/voice-chat', methods=['POST'])
@limiter.limit(AI_RATE_LIMIT)
def voice_chat():
    """Complete voice interaction: speech input -> AI response -> speech output"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get AI response from existing chat endpoint logic
        if not gemini_model:
            ai_response = "Hello! I'm Kisan Mitra AI, your farming assistant. I can help you with crop cultivation, pest management, soil health, and other farming questions."
        else:
            try:
                full_prompt = f"{FARMING_SYSTEM_PROMPT}\n\nUser: {message}\n\nKisan Mitra AI:"
                response = gemini_model.generate_content(full_prompt, request_options=GEMINI_REQUEST_OPTIONS)
                ai_response = response.text.strip()
            except Exception as e:
                print(f"Gemini error in voice chat: {str(e)}")
                ai_response = "I'm here to help with farming questions. How can I assist you today?"
        
        # Log the conversation
        print(f"[Voice Chat] User: {message}")
        print(f"[Voice Chat] Bot: {ai_response}")
        
        # Prepare response
        result = {
            'success': True,
            'message': message,
            'response': ai_response,
            'timestamp': datetime.now().isoformat()
        }
        
        # If Replicate is available, generate speech
        if replicate_api_token and replicate is not None:
            try:
                # Limit response length for voice generation
                speech_text = ai_response[:500] + "..." if len(ai_response) > 500 else ai_response
                
                output = replicate.run(
                    "iic/cosyvoice2-0.5b:8cd0f4b6ae0d3e5aff0fa0f9ccedb97d8f58a1df5ab4ff91b6be2d3d3e3b68e",
                    input={
                        "text": speech_text,
                        "voice": "中文女",
                        "language": "auto"
                    }
                )
                
                if output and len(output) > 0:
                    audio_url = output[0] if isinstance(output, list) else output
                    result['audio_url'] = audio_url
                    result['has_audio'] = True
                else:
                    result['has_audio'] = False
                    result['fallback_tts'] = True
                    
            except Exception as tts_error:
                print(f"TTS generation error: {str(tts_error)}")
                result['has_audio'] = False
                result['fallback_tts'] = True
        else:
            result['has_audio'] = False
            result['fallback_tts'] = True
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in voice chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'fallback_tts': True
        }), 500

# Gemini AI API endpoints for treatment management
@app.route('/api/treatment/fertilizers', methods=['POST'])
@limiter.limit(AI_RATE_LIMIT)
def get_fertilizer_recommendations():
    """Get fertilizer recommendations using Gemini AI"""
    try:
        data = request.get_json()
        if not data or 'disease' not in data:
            return jsonify({"error": "Disease name is required"}), 400
        
        disease_name = data['disease']
        
        # Prepare Gemini API prompt for fertilizer recommendations
        prompt = f"""
        As an agricultural expert, provide fertilizer recommendations for treating {disease_name} in plants.
        
        Please provide exactly 3 fertilizer recommendations in this JSON format:
        {{
            "fertilizers": [
                {{
                    "name": "Fertilizer name",
                    "price": "₹XXX",
                    "availability": "In Stock" or "Out of Stock"
                }}
            ]
        }}
        
        Focus on effective, commonly available fertilizers for treating {disease_name}.
        """
        
        try:
            if gemini_model:
                response = gemini_model.generate_content(prompt, request_options=GEMINI_REQUEST_OPTIONS)
                response_text = response.text.strip()
                
                # Try to extract JSON from response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx > start_idx:
                    import json
                    fertilizer_data = json.loads(response_text[start_idx:end_idx])
                    return jsonify({
                        "success": True,
                        "fertilizers": fertilizer_data.get("fertilizers", [])
                    })
        except Exception as e:
            print(f"Gemini API error for fertilizers: {str(e)}")
        
        # Fallback recommendations
        fallback_fertilizers = [
            {"name": "Copper Fungicide Spray", "price": "₹450", "availability": "In Stock"},
            {"name": "Organic Disease Control", "price": "₹320", "availability": "In Stock"},
            {"name": "Plant Immunity Booster", "price": "₹280", "availability": "Out of Stock"}
        ]
        
        return jsonify({
            "success": True,
            "fertilizers": fallback_fertilizers,
            "note": "Using fallback recommendations"
        })
        
    except Exception as e:
        print(f"Error in fertilizer recommendations: {str(e)}")
        return jsonify({"error": "Failed to get fertilizer recommendations"}), 500

@app.route('/api/treatment/steps', methods=['POST'])
@limiter.limit(AI_RATE_LIMIT)
def get_treatment_steps():
    """Get treatment steps using Gemini AI"""
    try:
        data = request.get_json()
        if not data or 'disease' not in data:
            return jsonify({"error": "Disease name is required"}), 400
        
        disease_name = data['disease']
        
        # Prepare Gemini API prompt for treatment steps
        prompt = f"""
        As an agricultural expert, provide treatment steps for {disease_name} in plants.
        
        Please provide exactly 5 treatment steps in this JSON format:
        {{
            "steps": [
                {{
                    "step": 1,
                    "title": "Step title",
                    "description": "Detailed description of what to do"
                }}
            ]
        }}
        
        Focus on practical, actionable steps that farmers can easily follow to treat {disease_name}.
        """
        
        try:
            if gemini_model:
                response = gemini_model.generate_content(prompt, request_options=GEMINI_REQUEST_OPTIONS)
                response_text = response.text.strip()
                
                # Try to extract JSON from response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx > start_idx:
                    import json
                    steps_data = json.loads(response_text[start_idx:end_idx])
                    return jsonify({
                        "success": True,
                        "steps": steps_data.get("steps", [])
                    })
        except Exception as e:
            print(f"Gemini API error for treatment steps: {str(e)}")
        
        # Fallback treatment steps
        fallback_steps = [
            {"step": 1, "title": "Remove Affected Parts", "description": "Carefully remove all affected leaves and stems. Dispose away from healthy plants."},
            {"step": 2, "title": "Apply Treatment", "description": "Apply appropriate fungicide or treatment as recommended. Follow label instructions."},
            {"step": 3, "title": "Improve Conditions", "description": "Improve air circulation and avoid overhead watering to prevent reinfection."},
            {"step": 4, "title": "Monitor Progress", "description": "Check daily for new symptoms. Recovery should begin within 5-7 days."},
            {"step": 5, "title": "Follow-up Care", "description": "Continue monitoring and apply follow-up treatments as needed."}
        ]
        
        return jsonify({
            "success": True,
            "steps": fallback_steps,
            "note": "Using fallback treatment steps"
        })
        
    except Exception as e:
        print(f"Error in treatment steps: {str(e)}")
        return jsonify({"error": "Failed to get treatment steps"}), 500


@app.route('/api/treatments', methods=['GET', 'POST'])
def manage_treatments():
    """Manage active treatments - GET to list, POST to create"""
    if request.method == 'GET':
        # Get treatments from localStorage (frontend manages this)
        # This endpoint could be enhanced to store in database
        return jsonify({
            "success": True,
            "message": "Treatments are managed on frontend via localStorage"
        })
    
    elif request.method == 'POST':
        # Create new treatment
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No treatment data provided"}), 400
            
            # For now, return success as frontend handles storage
            return jsonify({
                "success": True,
                "message": "Treatment created successfully",
                "treatment_id": str(int(datetime.now().timestamp()))
            })
            
        except Exception as e:
            print(f"Error creating treatment: {str(e)}")
            return jsonify({"error": "Failed to create treatment"}), 500

# Static file serving for production
# Get absolute path to dist directory
import os
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist'))

@app.route('/')
def serve_index():
    """Serve the React app's index.html"""
    try:
        return send_file(os.path.join(dist_dir, 'index.html'))
    except FileNotFoundError:
        return jsonify({"error": "Frontend not built. Run 'npm run build' first."}), 404

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files from the React build"""
    try:
        return send_from_directory(dist_dir, filename)
    except NotFound:
        # For SPA routing, serve index.html for unknown routes
        try:
            return send_file(os.path.join(dist_dir, 'index.html'))
        except FileNotFoundError:
            return jsonify({"error": "Frontend not built. Run 'npm run build' first."}), 404

if __name__ == '__main__':
    if not gemini_api_key:
        print("Warning: Gemini API key not found in environment variables - chat will use fallback responses")
    
    # Run the Flask app
    # In production on Replit, use port 5000 (single server for both API and static files)
    # In development, use port 8000 to avoid conflict with Vite dev server on 5000
    is_production = os.environ.get('FLASK_ENV') == 'production'
    port = int(os.environ.get('PORT', 5000 if is_production else 8000))
    debug_mode = not is_production
    
    if is_production:
        print("[INFO] Starting production server on port 5000 - serving both API and static files")
        app.run(debug=debug_mode, host='0.0.0.0', port=port)
    else:
        print("[INFO] Starting development server on port 8000")
        # Bind to all interfaces (0.0.0.0) to allow mobile network access
        app.run(debug=True, host='0.0.0.0', port=8000)