#!/usr/bin/env python3

import requests
import json

# Test registration
def test_register():
    url = "http://localhost:8000/api/auth/register"
    data = {
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User",
        "phone": "1234567890",
        "location": "Test City",
        "state": "TS"
    }
    
    try:
        response = requests.post(url, json=data)
        print("Registration Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"Registration Error: {e}")
        return None

# Test login
def test_login():
    url = "http://localhost:8000/api/auth/login"
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=data)
        print("\nLogin Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"Login Error: {e}")
        return None

# Test health check
def test_health():
    url = "http://localhost:8000/api/health"
    
    try:
        response = requests.get(url)
        print("Health Check Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"Health Check Error: {e}")
        return None

if __name__ == "__main__":
    print("=== Testing Supabase Authentication Integration ===\n")
    
    # Test health first
    health = test_health()
    
    # Test registration
    register_result = test_register()
    
    # Test login
    login_result = test_login()
    
    if login_result and 'session' in login_result:
        token = login_result['session']['access_token']
        print(f"\n✅ Authentication successful! Token: {token[:20]}...")
        
        # Test authenticated endpoint
        headers = {"Authorization": f"Bearer {token}"}
        try:
            profile_response = requests.get("http://localhost:8000/api/auth/profile", headers=headers)
            print(f"\nProfile Response: {profile_response.json()}")
        except Exception as e:
            print(f"Profile Error: {e}")
    
    print("\n=== Test Complete ===")
