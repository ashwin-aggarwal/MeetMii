"""
ORM model representing a user profile in the MeetMii platform.

Each Profile row stores the public-facing information for a user,
linked to the users table in user_service via user_id. One user
has exactly one profile.
"""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    snapchat = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    twitter = Column(String, nullable=True)
    tiktok = Column(String, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    is_professional_mode = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
