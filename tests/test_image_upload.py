#!/usr/bin/env python3

import requests
import json
import base64
from PIL import Image
import io

def create_test_plant_image():
    """Create a test plant image for testing"""
    # Create a simple green image (simulating a plant leaf)
    img = Image.new('RGB', (224, 224), color=(34, 139, 34))  # Forest green
    
    # Add some texture to make it look more like a leaf
    pixels = img.load()
    for i in range(224):
        for j in range(224):
            if (i + j) % 20 == 0:  # Add some pattern
                pixels[i, j] = (20, 100, 20)
    
    return img

def test_image_upload_multipart():
    """Test image upload using multipart/form-data (like frontend)"""
    print("=== Testing Multipart Image Upload (Frontend Style) ===")
    
    # Create test image
    test_image = create_test_plant_image()
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    test_image.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    # Prepare multipart form data
    files = {
        'file': ('test_plant.jpg', img_byte_arr, 'image/jpeg')
    }
    data = {
        'crop_name': 'tomato'
    }
    
    # Test without auth first (should fail)
    url = "http://localhost:8000/api/diagnose"
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ Auth required (expected)")
            return test_with_auth_multipart()
        else:
            print("❌ Unexpected response")
            return False
            
    except Exception as e:
        print(f"❌ Upload test error: {e}")
        return False

def test_with_auth_multipart():
    """Test with authentication"""
    print("\n=== Testing with Authentication ===")
    
    # First get auth token
    login_url = "http://localhost:8000/api/auth/login"
    login_data = {
        "email": "test@example.com", 
        "password": "password123"
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return False
        
        token = login_response.json()['session']['access_token']
        print("✅ Got auth token")
        
        # Now test image upload with auth
        test_image = create_test_plant_image()
        img_byte_arr = io.BytesIO()
        test_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        files = {
            'file': ('test_plant.jpg', img_byte_arr, 'image/jpeg')
        }
        data = {
            'crop_name': 'tomato'
        }
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        url = "http://localhost:8000/api/diagnose"
        response = requests.post(url, files=files, data=data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        
        if response.status_code == 200 and result.get('success'):
            disease_info = result.get('result', {})
            print(f"✅ Disease Detection: {disease_info.get('disease', 'Unknown')}")
            print(f"✅ Confidence: {disease_info.get('confidence', 0)}%")
            print(f"✅ Model Used: {disease_info.get('model_used', 'Unknown')}")
            return True
        else:
            print(f"❌ Diagnosis failed: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Auth test error: {e}")
        return False

def test_base64_upload():
    """Test base64 image upload (alternative method)"""
    print("\n=== Testing Base64 Image Upload ===")
    
    # Get auth token
    login_url = "http://localhost:8000/api/auth/login"
    login_data = {"email": "test@example.com", "password": "password123"}
    
    try:
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed")
            return False
        
        token = login_response.json()['session']['access_token']
        
        # Create test image and convert to base64
        test_image = create_test_plant_image()
        img_byte_arr = io.BytesIO()
        test_image.save(img_byte_arr, format='JPEG')
        img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode()
        
        # Test with image_data field (common in frontends)
        url = "http://localhost:8000/api/diagnose"
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        data = {
            'image_data': f'data:image/jpeg;base64,{img_base64}',
            'crop_name': 'tomato'
        }
        
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        
        if response.status_code == 200 and result.get('success'):
            disease_info = result.get('result', {})
            print(f"✅ Disease Detection: {disease_info.get('disease', 'Unknown')}")
            print(f"✅ Confidence: {disease_info.get('confidence', 0)}%")
            return True
        else:
            print(f"❌ Base64 upload failed: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Base64 test error: {e}")
        return False

def main():
    """Run all upload tests"""
    print("🧪 FRONTEND IMAGE UPLOAD COMPATIBILITY TEST\n")
    
    results = {
        "Multipart Upload": test_image_upload_multipart(),
        "Base64 Upload": test_base64_upload()
    }
    
    print("\n" + "="*50)
    print("📊 UPLOAD TEST RESULTS:")
    print("="*50)
    
    for test_name, status in results.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {test_name}: {'WORKING' if status else 'FAILED'}")
    
    if all(results.values()):
        print("\n🎉 All upload methods working!")
        print("Frontend should be able to upload images successfully")
    else:
        print("\n⚠️ Some upload methods failed")
        print("Check the detailed logs above")

if __name__ == "__main__":
    main()
