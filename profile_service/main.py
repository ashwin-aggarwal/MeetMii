from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, Base, get_db
import models
import schemas
import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/users/login")


@app.get("/")
def root():
    return {"message": "MeetMii profile service is running"}


@app.get("/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected"}


@app.get("/profile/table-check")
def table_check():
    return {"status": "profiles table created successfully"}


@app.post("/profile", response_model=schemas.ProfileResponse)
def upsert_profile(
    body: schemas.ProfileRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user_id = auth.get_current_user_id(token)
    payload = auth.verify_token(token)
    username = payload.get("email", "").split("@")[0]

    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()

    if profile:
        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
        profile.updated_at = datetime.now(timezone.utc)
    else:
        profile = models.Profile(
            user_id=user_id,
            username=username,
            **body.model_dump(exclude_unset=True),
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile
