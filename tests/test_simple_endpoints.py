#!/usr/bin/env python3

import requests
import json

def test_profile_endpoint():
    """Test profile endpoint directly"""
    print("=== Testing Profile Endpoint ===")
    
    # First login to get a real token
    login_url = "http://localhost:8000/api/auth/login"
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result['session']['access_token']
            print("✅ Login successful")
            
            # Test profile endpoint
            profile_url = "http://localhost:8000/api/auth/profile"
            headers = {"Authorization": f"Bearer {token}"}
            
            profile_response = requests.get(profile_url, headers=headers)
            print(f"Profile Status: {profile_response.status_code}")
            print(f"Profile Response: {profile_response.text}")
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print("✅ Profile endpoint working")
                return True
            else:
                print("❌ Profile endpoint failed")
                return False
        else:
            print(f"❌ Login failed: {login_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def test_diagnoses_endpoint():
    """Test diagnoses endpoint"""
    print("\n=== Testing Diagnoses Endpoint ===")
    
    # Login first
    login_url = "http://localhost:8000/api/auth/login"
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result['session']['access_token']
            
            # Test diagnoses endpoint
            diagnoses_url = "http://localhost:8000/api/diagnoses"
            headers = {"Authorization": f"Bearer {token}"}
            
            diagnoses_response = requests.get(diagnoses_url, headers=headers)
            print(f"Diagnoses Status: {diagnoses_response.status_code}")
            print(f"Diagnoses Response: {diagnoses_response.text}")
            
            if diagnoses_response.status_code == 200:
                print("✅ Diagnoses endpoint working")
                return True
            else:
                print("❌ Diagnoses endpoint failed")
                return False
        else:
            print("❌ Login failed for diagnoses test")
            return False
            
    except Exception as e:
        print(f"❌ Diagnoses test error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 TESTING INDIVIDUAL ENDPOINTS\n")
    
    profile_ok = test_profile_endpoint()
    diagnoses_ok = test_diagnoses_endpoint()
    
    print(f"\n📊 Results:")
    print(f"Profile: {'✅ OK' if profile_ok else '❌ FAILED'}")
    print(f"Diagnoses: {'✅ OK' if diagnoses_ok else '❌ FAILED'}")
