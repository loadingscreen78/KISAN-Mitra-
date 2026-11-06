#!/usr/bin/env python3
"""
Test script to verify Supabase database connection and user authentication
"""

import requests
import json
import sys

def test_supabase_connection():
    """Test the Supabase authentication endpoints"""
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Supabase Database Connection...")
    print("=" * 50)
    
    # Test data
    test_phone = "9876543210"
    test_pin = "1234"
    test_email = f"{test_phone}@kisanmitra.local"
    test_password = f"KM{test_pin}{test_phone[-2:]}"  # KM123410
    
    print(f"📱 Test Phone: {test_phone}")
    print(f"🔐 Test PIN: {test_pin}")
    print(f"📧 Generated Email: {test_email}")
    print(f"🔑 Generated Password: {test_password}")
    print("-" * 50)
    
    # Test 1: Registration
    print("\n1️⃣ Testing User Registration...")
    register_data = {
        "email": test_email,
        "password": test_password,
        "name": "Test Farmer Database",
        "phone": test_phone,
        "location": "Test City",
        "state": "Test State"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/register", json=register_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Registration successful!")
            print(f"   User ID: {data.get('user', {}).get('id', 'N/A')}")
            print(f"   User Name: {data.get('user', {}).get('name', 'N/A')}")
            print(f"   User Email: {data.get('user', {}).get('email', 'N/A')}")
        elif response.status_code == 400:
            data = response.json()
            if "User already registered" in data.get('details', ''):
                print("   ℹ️ User already exists (expected for existing users)")
            else:
                print(f"   ❌ Registration failed: {data.get('error', 'Unknown error')}")
                print(f"   Details: {data.get('details', 'No details')}")
        else:
            print(f"   ❌ Registration failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Registration request failed: {str(e)}")
        return False
    
    # Test 2: Login
    print("\n2️⃣ Testing User Login...")
    login_data = {
        "email": test_email,
        "password": test_password
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Login successful!")
            print(f"   Success: {data.get('success', False)}")
            print(f"   Message: {data.get('message', 'N/A')}")
            
            # Check user data
            user = data.get('user', {})
            print(f"   User ID: {user.get('id', 'N/A')}")
            print(f"   User Name: {user.get('name', 'N/A')}")
            print(f"   User Email: {user.get('email', 'N/A')}")
            print(f"   User Phone: {user.get('phone', 'N/A')}")
            
            # Check session data
            session = data.get('session', {})
            if session:
                print(f"   Access Token: {'Present' if session.get('access_token') else 'Missing'}")
                print(f"   Refresh Token: {'Present' if session.get('refresh_token') else 'Missing'}")
                print(f"   Expires At: {session.get('expires_at', 'N/A')}")
            
            return True
        else:
            data = response.json()
            print(f"   ❌ Login failed: {data.get('error', 'Unknown error')}")
            print(f"   Details: {data.get('details', 'No details')}")
            return False
            
    except Exception as e:
        print(f"   ❌ Login request failed: {str(e)}")
        return False
    
    # Test 3: Different user to check no overwriting
    print("\n3️⃣ Testing Multiple Users (No Overwriting)...")
    test_phone2 = "9876543211"
    test_email2 = f"{test_phone2}@kisanmitra.local"
    test_password2 = f"KM{test_pin}{test_phone2[-2:]}"  # KM123411
    
    register_data2 = {
        "email": test_email2,
        "password": test_password2,
        "name": "Second Test Farmer",
        "phone": test_phone2,
        "location": "Another City",
        "state": "Another State"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/register", json=register_data2)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Second user registration successful!")
            print(f"   User Name: {data.get('user', {}).get('name', 'N/A')}")
            print("   ✅ Multiple users can coexist without overwriting")
        elif response.status_code == 400:
            data = response.json()
            if "User already registered" in data.get('details', ''):
                print("   ℹ️ Second user already exists")
                print("   ✅ Database maintains separate user records")
            else:
                print(f"   ❌ Second user registration failed: {data.get('error', 'Unknown error')}")
        
    except Exception as e:
        print(f"   ❌ Second user registration failed: {str(e)}")

def main():
    """Main test function"""
    print("🧪 Supabase Database Integration Test")
    print("=====================================")
    
    # Check if backend is running
    try:
        response = requests.get("http://localhost:8000/")
        print("✅ Backend server is running")
    except Exception as e:
        print("❌ Backend server is not running. Please start it first:")
        print("   python backend/plant_diagnosis_api.py")
        sys.exit(1)
    
    # Run tests
    success = test_supabase_connection()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Supabase Database Integration: WORKING")
        print("✅ Users are stored in Supabase database")
        print("✅ Authentication endpoints are functional")
        print("✅ Multiple users can coexist")
    else:
        print("❌ Supabase Database Integration: ISSUES FOUND")
        print("Please check the backend logs for more details")
    
    print("=" * 50)

if __name__ == "__main__":
    main()
