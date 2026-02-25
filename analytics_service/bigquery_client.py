"""
BigQuery client setup for MeetMii analytics service.

Creates the dataset and scan_events table if they don't already exist.
All functions are idempotent — safe to call on every startup.
"""

import os
from dotenv import load_dotenv
from google.cloud import bigquery
from google.cloud.exceptions import Conflict

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
DATASET_ID = os.getenv("BIGQUERY_DATASET_ID")

client = bigquery.Client(project=PROJECT_ID)


def get_or_create_dataset():
    """Create the BigQuery dataset if it does not already exist.

    Uses the BIGQUERY_DATASET_ID environment variable as the dataset name.
    Silently succeeds if the dataset already exists.
    Returns the Dataset object.
    """
    dataset_ref = bigquery.Dataset(f"{PROJECT_ID}.{DATASET_ID}")
    try:
        return client.create_dataset(dataset_ref)
    except Conflict:
        return client.get_dataset(dataset_ref)


def get_or_create_table():
    """Create the scan_events table if it does not already exist.

    Schema:
      - username:   STRING, required — the profile username that was scanned
      - scanned_at: TIMESTAMP, required — when the scan occurred
      - ip_address: STRING, nullable — the IP address of the scanner

    Silently succeeds if the table already exists.
    Returns the Table object.
    """
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.scan_events"
    schema = [
        bigquery.SchemaField("username", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("scanned_at", "TIMESTAMP", mode="REQUIRED"),
        bigquery.SchemaField("ip_address", "STRING", mode="NULLABLE"),
    ]
    table = bigquery.Table(table_ref, schema=schema)
    try:
        return client.create_table(table)
    except Conflict:
        return client.get_table(table_ref)
