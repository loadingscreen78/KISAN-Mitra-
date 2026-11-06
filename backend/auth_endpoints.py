#!/usr/bin/env python3

import os
from flask import Blueprint, request, jsonify, g
from backend.auth_utils import supabase, require_auth, optional_auth
from backend.supabase_db import (
    create_user, get_user_by_id, update_user_profile,
    create_user_activity
)
import uuid

# Create Blueprint for auth endpoints
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with Supabase Auth and create profile"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        location = data.get('location')
        state = data.get('state')
        
        # Validate required fields
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if not name:
            return jsonify({"error": "Name is required"}), 400
        
        # Register with Supabase Auth
        if not supabase:
            print("[ERROR] Supabase client not initialized")
            return jsonify({"error": "Authentication service not available", "details": "Supabase client not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env"}), 503
        
        try:
            print(f"Attempting to register user: {email}")
            # Disable email confirmation to avoid rate limits
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "email_redirect_to": None,
                    "data": {
                        "name": name,
                        "phone": phone,
                        "location": location,
                        "state": state
                    }
                }
            })
            print(f"Supabase auth response received: {auth_response}")
        except Exception as auth_error:
            error_msg = str(auth_error)
            print(f"[ERROR] Supabase auth signup error: {error_msg}")
            print(f"Error type: {type(auth_error)}")
            return jsonify({"error": "Registration failed", "details": error_msg}), 400
        
        if hasattr(auth_response, 'user') and auth_response.user:
            # Create user profile in Supabase database
            try:
                user = create_user(
                    user_id=auth_response.user.id,
                    email=auth_response.user.email,
                    name=name,
                    phone=phone,
                    location=location,
                    state=state,
                    user_metadata=getattr(auth_response.user, 'user_metadata', {})
                )
                
                # Log registration activity
                create_user_activity(
                    user_id=auth_response.user.id,
                    action="user_registered",
                    data={
                        "registration_method": "supabase_auth",
                        "email": email,
                        "location": location,
                        "state": state
                    }
                )
                
            except Exception as db_error:
                print(f"Database error during registration: {db_error}")
                # Continue even if profile creation fails
            
            return jsonify({
                "success": True,
                "message": "User registered successfully",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "name": name,
                    "phone": phone,
                    "location": location,
                    "state": state,
                    "email_confirmed": auth_response.user.email_confirmed_at is not None,
                    "user_metadata": auth_response.user.user_metadata,
                    "created_at": auth_response.user.created_at
                },
                "session": {
                    "access_token": auth_response.session.access_token if auth_response.session else None,
                    "refresh_token": auth_response.session.refresh_token if auth_response.session else None
                }
            })
        else:
            print(f"[ERROR] Auth response missing user: {auth_response}")
            return jsonify({
                "error": "Registration failed",
                "details": f"Invalid response from authentication service: {str(auth_response)}"
            }), 400
            
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Registration error: {error_msg}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Registration failed", "details": error_msg}), 500

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """Login user with Supabase Auth"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if not supabase:
            return jsonify({"error": "Authentication service not available"}), 503
        
        # First check if user exists in our database before attempting Supabase auth
        try:
            # Check if user exists by looking for existing users with this email
            existing_users = supabase.auth.admin.list_users()
            user_exists = False
            
            if hasattr(existing_users, 'data') and existing_users.data:
                for user in existing_users.data:
                    if user.email == email:
                        user_exists = True
                        break
            
            if not user_exists:
                print(f"User does not exist in database: {email}")
                return jsonify({"error": "Invalid credentials - user not found"}), 401
                
        except Exception as db_check_error:
            print(f"Database check error: {db_check_error}")
            # If we can't check the database, still try auth but log the issue
            pass

        # Login with Supabase Auth
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
        except Exception as auth_error:
            print(f"Supabase auth login error: {auth_error}")
            return jsonify({"error": "Invalid credentials"}), 401
        
        if hasattr(auth_response, 'user') and hasattr(auth_response, 'session') and auth_response.user and auth_response.session:
            # Log login activity
            try:
                create_user_activity(
                    user_id=auth_response.user.id,
                    action="user_login",
                    data={
                        "login_method": "supabase_auth",
                        "email": email
                    }
                )
            except Exception as db_error:
                print(f"Database error during login: {db_error}")
            
            # Get user metadata for consistent response format
            user_meta = auth_response.user.user_metadata or {}
            
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "name": user_meta.get('name', 'Farmer'),
                    "phone": user_meta.get('phone'),
                    "location": user_meta.get('location'),
                    "state": user_meta.get('state'),
                    "user_metadata": user_meta,
                    "created_at": auth_response.user.created_at
                },
                "session": {
                    "access_token": auth_response.session.access_token,
                    "refresh_token": auth_response.session.refresh_token,
                    "expires_at": auth_response.session.expires_at
                }
            })
        else:
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed", "details": str(e)}), 500

@auth_bp.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    """Logout user from Supabase Auth"""
    try:
        if not supabase:
            return jsonify({"error": "Authentication service not available"}), 503
        
        # Log logout activity
        try:
            create_user_activity(
                user_id=g.user_id,
                action="user_logout",
                data={"logout_method": "supabase_auth"}
            )
        except Exception as db_error:
            print(f"Database error during logout: {db_error}")
        
        # Logout from Supabase
        supabase.auth.sign_out()
        
        return jsonify({
            "success": True,
            "message": "Logout successful"
        })
        
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"error": "Logout failed", "details": str(e)}), 500

@auth_bp.route('/api/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get current user profile"""
    try:
        user = get_user_by_id(g.user_id)
        
        if not user:
            return jsonify({"error": "User profile not found"}), 404
        
        return jsonify({
            "id": user.get("id"),
            "email": user.get("email"),
            "full_name": user.get("full_name"),
            "phone": user.get("phone"),
            "location": user.get("location"),
            "farming_experience": user.get("farming_experience"),
            "created_at": user.get("created_at")
        })
        
    except Exception as e:
        print(f"Profile fetch error: {str(e)}")
        return jsonify({"error": "Failed to fetch profile", "details": str(e)}), 500

@auth_bp.route('/api/auth/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Update current user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Update allowed fields
        updates = {}
        if 'name' in data:
            updates['name'] = data['name']
        if 'phone' in data:
            updates['phone'] = data['phone']
        if 'location' in data:
            updates['location'] = data['location']
        if 'state' in data:
            updates['state'] = data['state']
        if 'avatar' in data:
            updates['avatar'] = data['avatar']
        
        user = update_user_profile(g.user_id, updates)
        
        # Log profile update activity
        create_user_activity(
            user_id=g.user_id,
            action="profile_updated",
            data={"updated_fields": list(data.keys())}
        )
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": user
        })
        
    except Exception as e:
        print(f"Profile update error: {str(e)}")
        return jsonify({"error": "Failed to update profile", "details": str(e)}), 500

@auth_bp.route('/api/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh authentication token"""
    try:
        data = request.get_json()
        
        if not data or 'refresh_token' not in data:
            return jsonify({"error": "Refresh token is required"}), 400
        
        if not supabase:
            return jsonify({"error": "Authentication service not available"}), 503
        
        # Refresh token with Supabase
        auth_response = supabase.auth.refresh_session(data['refresh_token'])
        
        if auth_response.session:
            return jsonify({
                "success": True,
                "session": {
                    "access_token": auth_response.session.access_token,
                    "refresh_token": auth_response.session.refresh_token,
                    "expires_at": auth_response.session.expires_at
                }
            })
        else:
            return jsonify({"error": "Token refresh failed"}), 401
            
    except Exception as e:
        print(f"Token refresh error: {str(e)}")
        return jsonify({"error": "Token refresh failed", "details": str(e)}), 500

if __name__ == '__main__':
    # Bind to all interfaces (0.0.0.0) to allow mobile network access
    app.run(debug=True, host='0.0.0.0', port=5000)
