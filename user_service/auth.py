"""
Password hashing utilities for the MeetMii user service.

Uses passlib with bcrypt as the hashing algorithm.
"""

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt and return the hash."""
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the bcrypt hash, False otherwise."""
    return _pwd_context.verify(plain, hashed)
