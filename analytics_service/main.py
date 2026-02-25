from fastapi import FastAPI
import bigquery_client

bigquery_client.get_or_create_dataset()
bigquery_client.get_or_create_table()

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii analytics service is running"}


@app.get("/health")
def health():
    return {"status": "healthy", "bigquery": "connected"}
