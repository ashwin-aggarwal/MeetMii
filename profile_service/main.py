from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, Base, get_db
import models
import schemas
import auth
import pubsub_publisher

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
    username = payload.get("username")
    if not username:
        raise HTTPException(status_code=401, detail="username not found in token")

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


@app.get("/profile/{username}", response_model=schemas.ProfileResponse)
def get_profile(username: str, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.username == username).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    pubsub_publisher.publish_scan_event(username)

    if profile.is_professional_mode:
        return schemas.ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            username=profile.username,
            display_name=profile.display_name,
            bio=profile.bio,
            instagram=None,
            snapchat=None,
            linkedin=profile.linkedin,
            twitter=None,
            tiktok=None,
            email=profile.email,
            website=profile.website,
            is_professional_mode=profile.is_professional_mode,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    return schemas.ProfileResponse.model_validate(profile)
