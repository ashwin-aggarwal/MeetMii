"""
ORM model representing a user in the MeetMii platform.

Each User row stores login credentials and a unique username.
The table is created automatically on app startup via Base.metadata.create_all.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
