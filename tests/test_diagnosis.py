#!/usr/bin/env python3

import requests
import json
import base64

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

def test_diagnosis_with_base64():
    """Test diagnosis endpoint with base64 image"""
    token = get_auth_token()
    if not token:
        print("❌ Could not get auth token")
        return
    
    # Create a simple test image (1x1 pixel red PNG)
    test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    
    url = "http://localhost:8000/api/diagnose"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "base64_image": test_image_b64,
        "crop_name": "Tomato"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print("Diagnosis Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"Diagnosis Error: {e}")
        return None

def test_user_diagnoses():
    """Test getting user diagnoses"""
    token = get_auth_token()
    if not token:
        print("❌ Could not get auth token")
        return
    
    # First get user profile to get user ID
    headers = {"Authorization": f"Bearer {token}"}
    profile_response = requests.get("http://localhost:8000/api/auth/profile", headers=headers)
    
    if profile_response.status_code != 200:
        print(f"❌ Could not get profile: {profile_response.json()}")
        return
    
    user_id = profile_response.json()['user']['id']
    
    # Get user diagnoses
    url = f"http://localhost:8000/api/users/{user_id}/diagnoses"
    
    try:
        response = requests.get(url, headers=headers)
        print("\nUser Diagnoses Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"User Diagnoses Error: {e}")
        return None

if __name__ == "__main__":
    print("=== Testing Authenticated Diagnosis Endpoints ===\n")
    
    # Test diagnosis
    diagnosis_result = test_diagnosis_with_base64()
    
    # Test getting user diagnoses
    diagnoses_result = test_user_diagnoses()
    
    print("\n=== Diagnosis Test Complete ===")
