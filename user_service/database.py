"""
Database setup for MeetMii user service.

- engine: SQLAlchemy engine created from DATABASE_URL env var.
          This is the low-level connection to PostgreSQL.

- SessionLocal: A session factory. Each request gets its own session
                created from this factory.

- Base: Declarative base class that all ORM models will inherit from.

- get_db: FastAPI dependency that yields a database session per request
          and ensures the session is closed when the request is done.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Low-level connection pool to PostgreSQL
engine = create_engine(DATABASE_URL)

# Factory for creating individual database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models to inherit from
Base = declarative_base()


def get_db():
    """Yield a database session and close it when the request is done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
