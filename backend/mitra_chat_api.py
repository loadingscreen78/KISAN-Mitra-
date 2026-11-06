from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Set up OpenAI client
api_key = os.getenv('OPENAI_API_KEY')  # Only use OpenAI API key
client = OpenAI(api_key=api_key) if api_key else None

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

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not client.api_key:
            return jsonify({'error': 'OpenAI API key not configured'}), 500
            
        # Create chat completion with OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": FARMING_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        bot_response = response.choices[0].message.content.strip()
        
        # Log the conversation for debugging (optional)
        print(f"[{datetime.now()}] User: {user_message}")
        print(f"[{datetime.now()}] Bot: {bot_response}")
        
        return jsonify({
            'response': bot_response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        error_str = str(e).lower()
        if "authentication" in error_str:
            return jsonify({'error': 'Invalid OpenAI API key'}), 401
        elif "rate_limit" in error_str:
            return jsonify({'error': 'API rate limit exceeded. Please try again later.'}), 429
        elif "openai" in error_str:
            return jsonify({'error': f'OpenAI API error: {str(e)}'}), 500
        else:
            print(f"Error in chat endpoint: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Mitra Chat API',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': bool(client.api_key)
    })

if __name__ == '__main__':
    if not os.getenv('OPENAI_API_KEY'):
        print("Warning: OPENAI_API_KEY not found in environment variables")
    
    app.run(host='0.0.0.0', port=8001, debug=True)