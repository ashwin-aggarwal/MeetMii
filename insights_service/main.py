from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii insights service is running"}
