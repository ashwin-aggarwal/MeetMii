"""
Password hashing and JWT utilities for the MeetMii user service.

Uses passlib with bcrypt for password hashing and python-jose for JWT encoding.
"""

import os
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt and return the hash."""
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the bcrypt hash, False otherwise."""
    return _pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    """Encode data as a signed JWT token with an expiration time.

    Reads JWT_SECRET_KEY, JWT_ALGORITHM, and JWT_EXPIRE_MINUTES from
    environment variables. The token expires after JWT_EXPIRE_MINUTES minutes.
    Returns the encoded JWT string.
    """
    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))

    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    return jwt.encode(payload, secret_key, algorithm=algorithm)
