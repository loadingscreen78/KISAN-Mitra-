#!/usr/bin/env python3

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_env_loading():
    """Test if environment variables are being loaded correctly"""
    print("=== Environment Variables Test ===\n")
    
    # Test Gemini API Key
    gemini_key = os.getenv('GEMINI_API_KEY')
    print(f"GEMINI_API_KEY: {gemini_key[:20]}..." if gemini_key else "GEMINI_API_KEY: Not found")
    
    # Test Replicate Token
    replicate_token = os.getenv('REPLICATE_API_TOKEN')
    print(f"REPLICATE_API_TOKEN: {replicate_token[:20]}..." if replicate_token else "REPLICATE_API_TOKEN: Not found")
    
    # Test HF Token
    hf_token = os.getenv('HF_TOKEN')
    print(f"HF_TOKEN: {hf_token[:20]}..." if hf_token else "HF_TOKEN: Not found")
    
    # Test Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    print(f"SUPABASE_URL: {supabase_url[:30]}..." if supabase_url else "SUPABASE_URL: Not found")
    
    print("\n=== Validation ===")
    
    # Check if keys are placeholders
    if gemini_key and gemini_key != 'your-gemini-api-key-here':
        print("✅ Gemini API key looks valid")
    else:
        print("❌ Gemini API key is placeholder or missing")
    
    if replicate_token and replicate_token != 'your-replicate-token-here':
        print("✅ Replicate token looks valid")
    else:
        print("❌ Replicate token is placeholder or missing")
    
    if hf_token and hf_token != 'your-hugging-face-token-here':
        print("✅ HF token looks valid")
    else:
        print("❌ HF token is placeholder or missing")

if __name__ == "__main__":
    test_env_loading()
