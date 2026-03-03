import os
import jwt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not found in environment")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    # Using PyJWT encode returns a string
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Validates our locally issued JWT and checks user_profiles.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
        profile_res = supabase.table('user_profiles').select('*').eq('email', email).single().execute()
        if not profile_res.data:
            raise credentials_exception
            
        return {
            "id": profile_res.data.get("id"),
            "email": profile_res.data.get("email"),
            "username": profile_res.data.get("full_name", "User"),
            "role": profile_res.data.get("role", "student")
        }

    except Exception as e:
        print(f"Auth error: {e}")
        raise credentials_exception

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """
    Checks if the validated user has an elevated role (Admin, Seating Manager, Staff).
    """
    elevated_roles = ["admin", "seating_manager", "club_coordinator"]
    if current_user["role"] not in elevated_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation restricted to Staff/Faculty/Admin users."
        )
    return current_user
