from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii analytics service is running"}
