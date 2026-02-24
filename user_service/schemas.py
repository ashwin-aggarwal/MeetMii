"""
Pydantic schemas for the MeetMii user service.

- RegisterRequest: Validates the request body for POST /users/register.
- UserResponse: Shapes the data returned to the client after creating a user.
                Uses from_attributes=True so SQLAlchemy model instances can be
                serialized directly.
- LoginRequest: Validates the request body for POST /users/login.
- TokenResponse: Shapes the JWT token returned after a successful login.
"""

from datetime import datetime
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    """Input schema for user registration."""

    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    """Input schema for user login."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """Output schema returned after a successful login."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Output schema returned after a user is created."""

    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
