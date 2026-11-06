#!/usr/bin/env python3

import os
import sys
from datetime import datetime

# Add the parent directory to Python path so we can import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import create_tables, test_connection, get_db_session, create_user, create_user_activity

def init_database():
    """Initialize the database with tables and sample data if needed"""
    print("Initializing database...")
    
    # Test database connection first
    if not test_connection():
        print("❌ Database connection failed. Please check your DATABASE_URL.")
        return False
    
    print("✅ Database connection successful")
    
    # Create tables
    if not create_tables():
        print("❌ Failed to create database tables")
        return False
    
    print("✅ Database tables created successfully")
    
    # Create a sample user for testing if none exists
    try:
        db = get_db_session()
        
        # Check if we have any users
        from database.models import User
        existing_users = db.query(User).count()
        
        if existing_users == 0:
            print("Creating sample user for testing...")
            
            sample_user = create_user(
                db=db,
                name="Test Farmer",
                phone="+919876543210",
                location="Test Village",
                state="Maharashtra",
                avatar=None
            )
            
            # Log the user creation activity
            create_user_activity(
                db=db,
                user_id=sample_user.id,
                action="user_registered",
                data={"registration_method": "system_init", "test_user": True}
            )
            
            print(f"✅ Sample user created with ID: {sample_user.id}")
        else:
            print(f"✅ Database already has {existing_users} users")
            
        db.close()
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        return False
    
    print("🎉 Database initialization completed successfully!")
    return True

def reset_database():
    """Drop all tables and recreate them (WARNING: This will delete all data!)"""
    print("⚠️  WARNING: This will delete all data in the database!")
    confirm = input("Are you sure you want to continue? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Operation cancelled.")
        return False
    
    try:
        from database.models import Base, engine
        
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("✅ All tables dropped")
        
        print("Recreating tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables recreated")
        
        print("🎉 Database reset completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Database management utility')
    parser.add_argument('command', choices=['init', 'reset'], help='Command to run')
    
    args = parser.parse_args()
    
    if args.command == 'init':
        success = init_database()
        sys.exit(0 if success else 1)
    elif args.command == 'reset':
        success = reset_database()
        sys.exit(0 if success else 1)