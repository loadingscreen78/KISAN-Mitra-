#!/usr/bin/env python3

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Numeric, ForeignKey, JSON, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

# Load environment variables from the project root .env file explicitly
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ENV_PATH = os.path.join(PROJECT_ROOT, '.env')

# Try explicit path first, then fallback to default discovery
if os.path.exists(ENV_PATH):
    load_dotenv(dotenv_path=ENV_PATH, override=False)
else:
    load_dotenv()

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # Supabase Auth UUID
    email = Column(String(255), unique=True, nullable=True)  # From Supabase Auth
    phone = Column(String(20), unique=True, nullable=True)  # From Supabase Auth
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True)
    avatar = Column(Text)
    user_metadata = Column(JSON)  # Store additional Supabase user metadata
    joined_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    listings = relationship("Listing", back_populates="user", cascade="all, delete-orphan")
    diagnoses = relationship("Diagnosis", back_populates="user", cascade="all, delete-orphan")
    advisory_records = relationship("AdvisoryRecord", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'phone': self.phone,
            'name': self.name,
            'location': self.location,
            'state': self.state,
            'avatar': self.avatar,
            'user_metadata': self.user_metadata,
            'joined_date': self.joined_date.isoformat() if self.joined_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Listing(Base):
    __tablename__ = 'listings'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    crop = Column(String(100), nullable=False)
    quantity = Column(String(50), nullable=False)
    price_per_kg = Column(Numeric(10, 2), nullable=False)
    market = Column(String(255), nullable=False)
    transport = Column(String(10), nullable=False)
    views = Column(Integer, default=0, nullable=False)
    inquiries = Column(Integer, default=0, nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default='active', nullable=False)  # active, sold, expired
    posted_date = Column(String(50), nullable=False)
    sold_date = Column(DateTime)
    sold_price = Column(Numeric(12, 2))
    buyer = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="listings")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': str(self.user_id),
            'crop': self.crop,
            'quantity': self.quantity,
            'price_per_kg': float(self.price_per_kg) if self.price_per_kg else None,
            'market': self.market,
            'transport': self.transport,
            'views': self.views,
            'inquiries': self.inquiries,
            'total_price': float(self.total_price) if self.total_price else None,
            'status': self.status,
            'posted_date': self.posted_date,
            'sold_date': self.sold_date.isoformat() if self.sold_date else None,
            'sold_price': float(self.sold_price) if self.sold_price else None,
            'buyer': self.buyer,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Diagnosis(Base):
    __tablename__ = 'diagnoses'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    crop_name = Column(String(100), nullable=False)
    diagnosis = Column(Text, nullable=False)
    confidence = Column(Integer, nullable=False)
    treatment = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="diagnoses")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': str(self.user_id),
            'crop_name': self.crop_name,
            'diagnosis': self.diagnosis,
            'confidence': self.confidence,
            'treatment': self.treatment,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AdvisoryRecord(Base):
    __tablename__ = 'advisory_records'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    saved_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="advisory_records")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': str(self.user_id),
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'saved_date': self.saved_date.isoformat() if self.saved_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserActivity(Base):
    __tablename__ = 'user_activities'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    action = Column(String(100), nullable=False)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="activities")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': str(self.user_id),
            'action': self.action,
            'data': self.data,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

# Database configuration and session management
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("⚠️ DATABASE_URL not found in environment after loading .env")
else:
    try:
        masked = DATABASE_URL[:16] + '...' if len(DATABASE_URL) > 20 else '***'
        print(f"🔐 DATABASE_URL detected: {masked}")
        print(f"🔗 Attempting connection to Supabase...")
    except Exception:
        pass

# Global variables for database engine and session
engine = None
SessionLocal = None
DB_AVAILABLE = False

def _ensure_ssl_in_database_url(database_url: str) -> str:
    """Ensure DATABASE_URL includes proper SSL configuration for Supabase"""
    if not database_url:
        return database_url
    
    # Fix double @ symbols in password if present
    if '@@' in database_url:
        database_url = database_url.replace('@@', '@')
    
    # Add SSL mode for Supabase/PostgreSQL if not present
    if 'sslmode=' not in database_url.lower():
        connector = '&' if '?' in database_url else '?'
        database_url += f'{connector}sslmode=require'
    
    return database_url

def _initialize_database():
    """Initialize database connection with proper error handling"""
    global engine, SessionLocal, DB_AVAILABLE
    
    if not DATABASE_URL:
        print("⚠️ DATABASE_URL not provided - running without database functionality")
        DB_AVAILABLE = False
        return False
    
    try:
        # Ensure SSL configuration for Supabase
        ssl_database_url = _ensure_ssl_in_database_url(DATABASE_URL)
        
        # Create engine with SSL and connection pooling
        engine = create_engine(
            ssl_database_url,
            pool_size=5,
            max_overflow=10,
            pool_recycle=3600,
            pool_pre_ping=True,  # Enable connection health checks
            echo=False  # Set to True for SQL debugging
        )
        
        # Create session factory
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Test the connection
        test_db = SessionLocal()
        test_db.execute(text("SELECT 1"))
        test_db.close()
        
        DB_AVAILABLE = True
        print("✅ Database connection initialized successfully")
        return True
        
    except Exception as e:
        print(f"⚠️ Database initialization failed: {e}")
        print("⚠️ Running without database functionality")
        DB_AVAILABLE = False
        engine = None
        SessionLocal = None
        return False

# Initialize database on module import
_initialize_database()

def create_tables():
    """Create all tables in the database"""
    if not DB_AVAILABLE or not engine:
        print("⚠️ Database not available - cannot create tables")
        return False
        
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
        return True
    except Exception as e:
        print(f"Error creating database tables: {e}")
        return False

def get_db():
    """Get database session (for FastAPI dependency injection)"""
    if not DB_AVAILABLE or not SessionLocal:
        raise RuntimeError("Database not available")
        
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_session():
    """Get database session for direct use"""
    if not DB_AVAILABLE or not SessionLocal:
        return None
    return SessionLocal()

def is_database_available() -> bool:
    """Check if database is available"""
    return DB_AVAILABLE

# Helper functions for database operations
def _validate_user_input(name: str, phone: str, location: str, state: str) -> list:
    """Validate user input parameters"""
    errors = []
    
    # Validate name
    if not name or not name.strip():
        errors.append("Name is required")
    elif len(name.strip()) < 2:
        errors.append("Name must be at least 2 characters long")
    elif len(name.strip()) > 255:
        errors.append("Name must be less than 255 characters")
    
    # Validate phone
    if not phone or not phone.strip():
        errors.append("Phone number is required")
    else:
        phone_clean = phone.strip().replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not phone_clean.startswith('+'):
            if phone_clean.startswith('91') and len(phone_clean) == 12:
                # Indian number without +
                pass
            elif len(phone_clean) == 10:
                # 10 digit number
                pass
            else:
                errors.append("Phone number must be a valid format (10 digits or +91xxxxxxxxxx)")
        elif len(phone_clean) < 10 or len(phone_clean) > 15:
            errors.append("Phone number must be between 10-15 digits")
    
    # Validate location
    if not location or not location.strip():
        errors.append("Location is required")
    elif len(location.strip()) > 255:
        errors.append("Location must be less than 255 characters")
    
    # Validate state
    if not state or not state.strip():
        errors.append("State is required")
    elif len(state.strip()) > 100:
        errors.append("State must be less than 100 characters")
    
    return errors

def create_user(db, name: str, phone: str, location: str, state: str, avatar: str = None) -> User:
    """Create a new user with proper validation and error handling"""
    if not db:
        raise RuntimeError("Database session not available")
    
    # Validate input
    validation_errors = _validate_user_input(name, phone, location, state)
    if validation_errors:
        raise ValueError(f"Validation errors: {', '.join(validation_errors)}")
    
    try:
        user = User(
            name=name.strip(),
            phone=phone.strip(),
            location=location.strip(),
            state=state.strip(),
            avatar=avatar
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create a detached copy of the user object that can be used outside the session
        user_copy = User(
            id=user.id,
            name=user.name,
            phone=user.phone,
            location=user.location,
            state=user.state,
            avatar=user.avatar,
            joined_date=user.joined_date,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        return user_copy
        
    except Exception as e:
        try:
            db.rollback()
        except:
            pass  # Rollback might fail if connection is lost
        
        # Handle specific database errors
        if 'unique constraint' in str(e).lower() or 'duplicate key' in str(e).lower():
            raise ValueError(f"A user with phone number {phone} already exists")
        else:
            raise RuntimeError(f"Database error: {str(e)}")

def get_user_by_phone(db, phone: str) -> User:
    """Get user by phone number with proper error handling"""
    if not db:
        return None
    if not phone or not phone.strip():
        return None
        
    try:
        return db.query(User).filter(User.phone == phone.strip()).first()
    except Exception as e:
        print(f"Error querying user by phone: {e}")
        return None

def get_user_by_id(db, user_id: int) -> User:
    """Get user by ID with proper error handling"""
    if not db:
        return None
    if not user_id or user_id <= 0:
        return None
        
    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        print(f"Error querying user by ID: {e}")
        return None

def create_diagnosis(db, user_id: int, crop_name: str, diagnosis: str, 
                    confidence: int, treatment: str, date: datetime = None) -> Diagnosis:
    """Create a new diagnosis record with proper error handling"""
    if not db:
        raise RuntimeError("Database session not available")
    
    # Validate input
    if not user_id or user_id <= 0:
        raise ValueError("Valid user_id is required")
    if not crop_name or not crop_name.strip():
        raise ValueError("Crop name is required")
    if not diagnosis or not diagnosis.strip():
        raise ValueError("Diagnosis is required")
    if confidence < 0 or confidence > 100:
        raise ValueError("Confidence must be between 0 and 100")
    if not treatment or not treatment.strip():
        raise ValueError("Treatment is required")
    
    try:
        if date is None:
            date = datetime.utcnow()
            
        diagnosis_record = Diagnosis(
            user_id=user_id,
            crop_name=crop_name.strip(),
            diagnosis=diagnosis.strip(),
            confidence=confidence,
            treatment=treatment.strip(),
            date=date
        )
        db.add(diagnosis_record)
        db.commit()
        db.refresh(diagnosis_record)
        
        # Create a detached copy
        diagnosis_copy = Diagnosis(
            id=diagnosis_record.id,
            user_id=diagnosis_record.user_id,
            crop_name=diagnosis_record.crop_name,
            diagnosis=diagnosis_record.diagnosis,
            confidence=diagnosis_record.confidence,
            treatment=diagnosis_record.treatment,
            date=diagnosis_record.date,
            created_at=diagnosis_record.created_at
        )
        return diagnosis_copy
        
    except Exception as e:
        try:
            db.rollback()
        except:
            pass  # Rollback might fail if connection is lost
        raise RuntimeError(f"Database error: {str(e)}")

def get_user_diagnoses(db, user_id: int, limit: int = 50):
    """Get recent diagnoses for a user with proper error handling"""
    if not db:
        return []
    if not user_id or user_id <= 0:
        return []
    if limit <= 0:
        limit = 50
        
    try:
        return db.query(Diagnosis).filter(Diagnosis.user_id == user_id)\
                 .order_by(Diagnosis.created_at.desc()).limit(limit).all()
    except Exception as e:
        print(f"Error querying user diagnoses: {e}")
        return []

def create_user_activity(db, user_id: int, action: str, data: dict = None):
    """Log user activity with proper error handling"""
    if not db:
        raise RuntimeError("Database session not available")
    
    # Validate input
    if not user_id or user_id <= 0:
        raise ValueError("Valid user_id is required")
    if not action or not action.strip():
        raise ValueError("Action is required")
    
    try:
        activity = UserActivity(
            user_id=user_id,
            action=action.strip(),
            data=data
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity
        
    except Exception as e:
        try:
            db.rollback()
        except:
            pass  # Rollback might fail if connection is lost
        raise RuntimeError(f"Database error: {str(e)}")

def test_connection():
    """Test live database connection"""
    if not DB_AVAILABLE:
        return False
        
    db = None
    try:
        db = get_db_session()
        if not db:
            return False
            
        # Simple query to test connection
        result = db.execute(text("SELECT 1")).fetchone()
        return result is not None
        
    except Exception as e:
        print(f"Database connection test failed: {e}")
        return False
    finally:
        if db:
            try:
                db.close()
            except:
                pass  # Ignore close errors