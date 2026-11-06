#!/usr/bin/env python3

import os
import jwt
from functools import wraps
from flask import request, jsonify, g
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional, Dict, Any

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

# Initialize Supabase client
supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

def initialize_supabase():
    """Initialize Supabase clients"""
    global supabase, supabase_admin
    
    if not SUPABASE_URL:
        print("[WARNING] SUPABASE_URL not found in environment")
        return False
    
    if not SUPABASE_ANON_KEY:
        print("[WARNING] SUPABASE_ANON_KEY not found in environment")
        return False
    
    try:
        # Client for user operations
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Admin client for service operations (if service role key is provided)
        if SUPABASE_SERVICE_ROLE_KEY:
            supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        print("[OK] Supabase clients initialized successfully")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase clients: {e}")
        return False

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify Supabase JWT token and return user data"""
    try:
        if not token:
            return None
        
        # For Supabase, we'll verify the token by making a request to get user info
        # This is more reliable than trying to decode the JWT locally
        user_data = get_user_from_token(token)
        return user_data
        
    except Exception as e:
        print(f"Error verifying JWT token: {e}")
        return None

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Get user information from Supabase using the token"""
    try:
        if not supabase or not token:
            return None
        
        # Get user info using the token
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                'id': user_response.user.id,
                'email': user_response.user.email,
                'phone': user_response.user.phone,
                'user_metadata': user_response.user.user_metadata or {},
                'app_metadata': user_response.user.app_metadata or {}
            }
        
        return None
        
    except Exception as e:
        print(f"Error getting user from token: {e}")
        return None

def require_auth(f):
    """Decorator to require authentication for API endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header missing'}), 401
        
        # Extract token (format: "Bearer <token>")
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Verify token and get user
        user_data = get_user_from_token(token)
        if not user_data:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Store user data in Flask's g object for use in the endpoint
        g.current_user = user_data
        g.user_id = user_data['id']
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """Decorator for optional authentication (user data available if token provided)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                user_data = get_user_from_token(token)
                if user_data:
                    g.current_user = user_data
                    g.user_id = user_data['id']
                else:
                    g.current_user = None
                    g.user_id = None
            except:
                g.current_user = None
                g.user_id = None
        else:
            g.current_user = None
            g.user_id = None
        
        return f(*args, **kwargs)
    
    return decorated_function

# Initialize Supabase on module import
initialize_supabase()
