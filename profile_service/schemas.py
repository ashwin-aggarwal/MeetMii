"""
Pydantic schemas for the MeetMii profile service.

- ProfileRequest: Validates the request body for POST /profile.
                  All fields are optional so callers only send what they want
                  to set or update.

- ProfileResponse: Shapes the profile data returned to the client.
                   Uses from_attributes=True so SQLAlchemy model instances
                   can be serialized directly.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProfileRequest(BaseModel):
    """Input schema for creating or updating a profile."""

    display_name: Optional[str] = None
    bio: Optional[str] = None
    instagram: Optional[str] = None
    snapchat: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    tiktok: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    is_professional_mode: Optional[bool] = False


class ProfileResponse(BaseModel):
    """Output schema returned after a profile is created or updated."""

    id: int
    user_id: int
    username: str
    display_name: Optional[str]
    bio: Optional[str]
    instagram: Optional[str]
    snapchat: Optional[str]
    linkedin: Optional[str]
    twitter: Optional[str]
    tiktok: Optional[str]
    email: Optional[str]
    website: Optional[str]
    is_professional_mode: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
