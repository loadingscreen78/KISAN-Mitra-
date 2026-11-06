#!/usr/bin/env python3

import os
from typing import Optional, Dict, List, Any
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

# Initialize Supabase clients
supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

def initialize_supabase_db():
    """Initialize Supabase clients for database operations"""
    global supabase, supabase_admin
    
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("[WARNING] Supabase configuration missing")
        return False
    
    try:
        # Client for user operations
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Admin client for service operations
        if SUPABASE_SERVICE_ROLE_KEY:
            supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        print("[OK] Supabase database clients initialized successfully")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase database clients: {e}")
        return False

def create_tables():
    """Create tables using Supabase SQL (tables should be created via Supabase dashboard)"""
    # Note: In Supabase, tables are typically created via the dashboard or migrations
    # This function is kept for compatibility but tables should be created in Supabase dashboard
    print("📦 Tables should be created via Supabase dashboard")
    return True

def test_connection():
    """Test Supabase connection"""
    try:
        if not supabase_admin:
            return False
        
        # Simple query to test connection
        result = supabase_admin.table('users').select('id').limit(1).execute()
        return True
        
    except Exception as e:
        print(f"Database connection test failed: {e}")
        return False

def is_database_available() -> bool:
    """Check if Supabase database is available"""
    return supabase is not None and supabase_admin is not None

# User operations
def create_user(user_id: str, email: str, name: str, phone: str = None, 
                location: str = None, state: str = None, user_metadata: dict = None):
    """Create a new user profile"""
    try:
        if not supabase_admin:
            raise Exception("Supabase admin client not available")
        
        user_data = {
            'id': user_id,
            'email': email,
            'name': name,
            'phone': phone,
            'location': location,
            'state': state,
            'user_metadata': user_metadata or {},
            'joined_date': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase_admin.table('users').insert(user_data).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise Exception("Failed to create user")
            
    except Exception as e:
        print(f"Error creating user: {e}")
        raise e

def get_user_by_id(user_id: str):
    """Get user by ID"""
    try:
        if not supabase_admin:
            return None
        
        result = supabase_admin.table('users').select('*').eq('id', user_id).execute()
        
        if result.data:
            return result.data[0]
        return None
        
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None

def get_user_by_email(email: str):
    """Get user by email"""
    try:
        if not supabase_admin:
            return None
        
        result = supabase_admin.table('users').select('*').eq('email', email).execute()
        
        if result.data:
            return result.data[0]
        return None
        
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None

def update_user_profile(user_id: str, updates: dict):
    """Update user profile"""
    try:
        if not supabase_admin:
            raise Exception("Supabase admin client not available")
        
        updates['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase_admin.table('users').update(updates).eq('id', user_id).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise Exception("Failed to update user")
            
    except Exception as e:
        print(f"Error updating user: {e}")
        raise e

# Diagnosis operations
def create_diagnosis(user_id: str, crop_name: str, diagnosis: str, 
                    confidence: int, treatment: str):
    """Create a new diagnosis record"""
    try:
        if not supabase_admin:
            raise Exception("Supabase admin client not available")
        
        diagnosis_data = {
            'user_id': user_id,
            'crop_name': crop_name,
            'diagnosis': diagnosis,
            'confidence': confidence,
            'treatment': treatment,
            'date': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = supabase_admin.table('diagnoses').insert(diagnosis_data).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise Exception("Failed to create diagnosis")
            
    except Exception as e:
        print(f"Error creating diagnosis: {e}")
        raise e

def get_user_diagnoses(user_id: str, limit: int = 50):
    """Get recent diagnoses for a user"""
    try:
        if not supabase_admin:
            return []
        
        result = supabase_admin.table('diagnoses')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data or []
        
    except Exception as e:
        print(f"Error getting user diagnoses: {e}")
        return []

# Activity logging
def create_user_activity(user_id: str, action: str, data: dict = None):
    """Log user activity"""
    try:
        if not supabase_admin:
            raise Exception("Supabase admin client not available")
        
        activity_data = {
            'user_id': user_id,
            'action': action,
            'data': data or {},
            'timestamp': datetime.utcnow().isoformat()
        }
        
        result = supabase_admin.table('user_activities').insert(activity_data).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise Exception("Failed to create activity")
            
    except Exception as e:
        print(f"Error creating user activity: {e}")
        raise e

# Initialize on module import
initialize_supabase_db()
