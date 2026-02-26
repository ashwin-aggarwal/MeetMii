"""
BigQuery client for the MeetMii insights service.

Reads from the existing scan_events table (written by analytics_service)
and writes generated insights to the weekly_insights table.
"""

import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from google.cloud import bigquery
from google.cloud.exceptions import Conflict

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
DATASET_ID = os.getenv("BIGQUERY_DATASET_ID")

client = bigquery.Client(project=PROJECT_ID)

SCAN_TABLE = f"`{PROJECT_ID}.{DATASET_ID}.scan_events`"
INSIGHTS_TABLE = f"`{PROJECT_ID}.{DATASET_ID}.weekly_insights`"
INSIGHTS_TABLE_REF = f"{PROJECT_ID}.{DATASET_ID}.weekly_insights"


def _ensure_insights_table():
    """Create the weekly_insights table if it does not already exist.

    Schema:
      - username:     STRING, required
      - insight:      STRING, required
      - week_start:   TIMESTAMP, required
      - generated_at: TIMESTAMP, required
    """
    schema = [
        bigquery.SchemaField("username", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("insight", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("week_start", "TIMESTAMP", mode="REQUIRED"),
        bigquery.SchemaField("generated_at", "TIMESTAMP", mode="REQUIRED"),
    ]
    table = bigquery.Table(INSIGHTS_TABLE_REF, schema=schema)
    try:
        client.create_table(table)
    except Conflict:
        pass


_ensure_insights_table()


def get_all_usernames() -> list[str]:
    """Return a list of every distinct username found in scan_events.

    Queries the scan_events table for all unique usernames that have at
    least one recorded scan. Returns an empty list if the table is empty.
    """
    query = f"SELECT DISTINCT username FROM {SCAN_TABLE}"
    rows = list(client.query(query).result())
    return [row.username for row in rows]


def get_weekly_scan_data(username: str) -> dict:
    """Return scan statistics for the past two weeks for a given username.

    Runs four queries against scan_events:
      - total_scans_this_week: scans in the last 7 days
      - total_scans_last_week: scans in the 7 days before that
      - busiest_day: day-of-week name with the highest scan count this week
      - busiest_hour: hour of day (0-23) with the highest scan count this week

    Returns a dict with those four keys. Returns zeros and empty strings
    if the username has no scans in the relevant windows.
    """
    param = bigquery.ScalarQueryParameter("username", "STRING", username)

    def run_count(where: str) -> int:
        q = f"SELECT COUNT(*) AS n FROM {SCAN_TABLE} WHERE username = @username AND {where}"
        rows = list(client.query(q, job_config=bigquery.QueryJobConfig(query_parameters=[param])).result())
        return rows[0].n if rows else 0

    this_week = run_count(
        "scanned_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)"
    )
    last_week = run_count(
        "scanned_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY)"
        " AND scanned_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)"
    )

    # Busiest day this week
    day_query = f"""
        SELECT FORMAT_TIMESTAMP('%A', scanned_at) AS day, COUNT(*) AS n
        FROM {SCAN_TABLE}
        WHERE username = @username
          AND scanned_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
        GROUP BY day
        ORDER BY n DESC
        LIMIT 1
    """
    day_rows = list(client.query(day_query, job_config=bigquery.QueryJobConfig(query_parameters=[param])).result())
    busiest_day = day_rows[0].day if day_rows else ""

    # Busiest hour this week
    hour_query = f"""
        SELECT EXTRACT(HOUR FROM scanned_at) AS hour, COUNT(*) AS n
        FROM {SCAN_TABLE}
        WHERE username = @username
          AND scanned_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
        GROUP BY hour
        ORDER BY n DESC
        LIMIT 1
    """
    hour_rows = list(client.query(hour_query, job_config=bigquery.QueryJobConfig(query_parameters=[param])).result())
    busiest_hour = int(hour_rows[0].hour) if hour_rows else 0

    return {
        "total_scans_this_week": this_week,
        "total_scans_last_week": last_week,
        "busiest_day": busiest_day,
        "busiest_hour": busiest_hour,
    }


def save_insight(username: str, insight: str, week_start: datetime) -> None:
    """Insert a generated insight row into the weekly_insights table.

    Sets generated_at to the current UTC timestamp. The week_start parameter
    marks which week the insight covers. Raises RuntimeError if the insert fails.
    """
    rows = [
        {
            "username": username,
            "insight": insight,
            "week_start": week_start.isoformat(),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    ]
    errors = client.insert_rows_json(INSIGHTS_TABLE_REF, rows)
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")


def get_latest_insight(username: str) -> str | None:
    """Return the most recently generated insight for a given username.

    Queries weekly_insights ordered by generated_at descending and returns
    the insight text of the first row. Returns None if no insight exists
    for that username yet.
    """
    param = bigquery.ScalarQueryParameter("username", "STRING", username)
    query = f"""
        SELECT insight
        FROM {INSIGHTS_TABLE}
        WHERE username = @username
        ORDER BY generated_at DESC
        LIMIT 1
    """
    rows = list(client.query(query, job_config=bigquery.QueryJobConfig(query_parameters=[param])).result())
    return rows[0].insight if rows else None
