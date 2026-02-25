from fastapi import FastAPI
import bigquery_client
import schemas

bigquery_client.get_or_create_dataset()
bigquery_client.get_or_create_table()

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii analytics service is running"}


@app.get("/health")
def health():
    return {"status": "healthy", "bigquery": "connected"}


@app.post("/analytics/scan")
def log_scan(body: schemas.ScanEvent):
    bigquery_client.log_scan(body.username, body.ip_address)
    return {"status": "scan logged", "username": body.username}


@app.get("/analytics/{username}/stats", response_model=schemas.ScanStatsResponse)
def get_stats(username: str):
    stats = bigquery_client.get_scan_stats(username)
    return schemas.ScanStatsResponse(username=username, **stats)
