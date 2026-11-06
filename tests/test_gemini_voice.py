#!/usr/bin/env python3

import requests
import json

def get_auth_token():
    """Login and get auth token"""
    url = "http://localhost:8000/api/auth/login"
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            return result['session']['access_token']
        else:
            print(f"Login failed: {response.json()}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_chat():
    """Test Gemini chat endpoint"""
    token = get_auth_token()
    if not token:
        print("❌ Could not get auth token")
        return
    
    url = "http://localhost:8000/api/chat"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "message": "What are common diseases in tomato plants?"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print("Chat Response:")
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Full Response: {result}")
        
        # Check if it's using fallback
        if 'note' in result and 'fallback' in result.get('note', '').lower():
            print("⚠️ Using fallback response - API key may be invalid")
        elif 'response' in result and 'technical difficulties' in result['response']:
            print("⚠️ Gemini API error - check API key validity")
        else:
            print("✅ Real Gemini AI response received")
        
        return result
    except Exception as e:
        print(f"Chat Error: {e}")
        return None

def test_voice_tts():
    """Test voice/TTS endpoint"""
    url = "http://localhost:8000/api/voice/tts"
    data = {
        "text": "Hello farmer, this is a test of the text to speech system."
    }
    
    try:
        response = requests.post(url, json=data)
        print("\nVoice TTS Response:")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ TTS working - audio file generated")
        else:
            print(f"Response: {response.json()}")
        return response
    except Exception as e:
        print(f"Voice TTS Error: {e}")
        return None

def test_treatment_endpoints():
    """Test treatment recommendation endpoints"""
    token = get_auth_token()
    if not token:
        print("❌ Could not get auth token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test treatment duration
    url = "http://localhost:8000/api/treatment/duration"
    data = {"disease": "Tomato Blight", "severity": "moderate"}
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print("\nTreatment Duration Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Treatment Duration Error: {e}")
    
    # Test fertilizer recommendations
    url = "http://localhost:8000/api/treatment/fertilizers"
    data = {"disease": "Tomato Blight", "crop": "tomato"}
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print("\nFertilizer Recommendations Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Fertilizer Recommendations Error: {e}")

if __name__ == "__main__":
    print("=== Testing Gemini Chat and Voice Functionality ===\n")
    
    # Test Gemini chat
    chat_result = test_chat()
    
    # Test voice TTS
    voice_result = test_voice_tts()
    
    # Test treatment endpoints
    test_treatment_endpoints()
    
    print("\n=== All Tests Complete ===")
