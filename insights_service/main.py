from datetime import datetime, timezone
from fastapi import FastAPI
import bigquery_client
import gemini_client

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii insights service is running"}


@app.post("/insights/generate")
def generate_insights():
    """Generate and store weekly insights for every user with scan data.

    Fetches all distinct usernames from BigQuery, pulls their weekly scan
    statistics, generates a personalised insight via Gemini, and saves the
    result back to the weekly_insights table.

    Intended to be called by Cloud Scheduler once per week.
    Returns a count of how many users were processed.
    """
    usernames = bigquery_client.get_all_usernames()
    week_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    count = 0

    for username in usernames:
        scan_data = bigquery_client.get_weekly_scan_data(username)
        insight = gemini_client.generate_insight(username, scan_data)
        bigquery_client.save_insight(username, insight, week_start)
        count += 1

    return {"status": "done", "users_processed": count}


@app.get("/insights/{username}")
def get_insight(username: str):
    """Return the latest generated insight for a given username.

    Looks up the most recent row in the weekly_insights table for the user.
    If no insight has been generated yet, returns a default prompt encouraging
    them to start sharing their card.
    """
    insight = bigquery_client.get_latest_insight(username)

    if not insight:
        insight = (
            "Start sharing your MeetMii card to get personalized weekly insights!"
        )

    return {"username": username, "insight": insight}
