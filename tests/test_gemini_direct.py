#!/usr/bin/env python3

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
PROJECT_ROOT = os.path.abspath('.')
ENV_PATH = os.path.join(PROJECT_ROOT, '.env')
load_dotenv(dotenv_path=ENV_PATH, override=True)

def test_gemini_direct():
    """Test Gemini API directly to verify key validity"""
    print("=== Direct Gemini API Test ===\n")
    
    # Get API key
    api_key = os.getenv('GEMINI_API_KEY')
    print(f"API Key: {api_key[:20]}...{api_key[-10:] if api_key else 'None'}")
    
    if not api_key:
        print("❌ No Gemini API key found")
        return False
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Initialize model
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Model initialized successfully")
        
        # Test simple generation
        response = model.generate_content("What are common tomato plant diseases? Give a brief answer.")
        
        print(f"✅ API Response: {response.text[:200]}...")
        return True
        
    except Exception as e:
        print(f"❌ Gemini API Error: {str(e)}")
        
        # Check for specific error types
        error_str = str(e).lower()
        if 'api key' in error_str or 'authentication' in error_str:
            print("🔑 Issue: Invalid API key")
        elif 'quota' in error_str or 'limit' in error_str:
            print("📊 Issue: API quota exceeded")
        elif 'permission' in error_str:
            print("🚫 Issue: API access denied")
        else:
            print("🔧 Issue: Unknown API error")
        
        return False

if __name__ == "__main__":
    success = test_gemini_direct()
    print(f"\n{'✅ Gemini API working' if success else '❌ Gemini API failed'}")
