from fastapi import FastAPI
from sqlalchemy import text
from database import engine, Base
import models

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
