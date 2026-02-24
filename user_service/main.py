from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, Base, get_db
import models
import schemas
import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii user service is running"}


@app.get("/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected"}


@app.get("/users/table-check")
def table_check():
    return {"status": "users table created successfully"}


@app.post("/users/register", response_model=schemas.UserResponse, status_code=201)
def register(body: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = models.User(
        email=body.email,
        username=body.username,
        hashed_password=auth.hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
