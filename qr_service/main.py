from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii QR service is running"}
