"""
JWT verification utilities for the MeetMii profile service.

Tokens are issued by user_service and verified here using the shared
JWT_SECRET_KEY and JWT_ALGORITHM environment variables.
"""

import os
from jose import jwt, JWTError
from fastapi import HTTPException


def verify_token(token: str) -> dict:
    """Decode and validate a JWT token, returning its payload.

    Reads JWT_SECRET_KEY and JWT_ALGORITHM from environment variables.
    Raises 401 if the token is invalid or expired.
    """
    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    try:
        return jwt.decode(token, secret_key, algorithms=[algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user_id(token: str) -> int:
    """Extract and return the user_id from a JWT token payload.

    Calls verify_token to decode the token, then pulls the 'sub' claim
    (which user_service stores as the user's integer id).
    Raises 401 if the user_id is not present in the payload.
    """
    payload = verify_token(token)
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(status_code=401, detail="user_id not found in token")
    return int(sub)
