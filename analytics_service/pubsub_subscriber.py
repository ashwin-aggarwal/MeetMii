"""
Pub/Sub subscriber for the MeetMii analytics service.

Listens to the qr-scanned subscription in a background thread and
writes each received scan event to BigQuery via bigquery_client.log_scan.
Running in a background thread means the subscriber never blocks the
FastAPI event loop.
"""

import os
import json
import logging
import threading
from dotenv import load_dotenv
from google.cloud import pubsub_v1
import bigquery_client

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
SUBSCRIPTION_NAME = os.getenv("PUBSUB_SUBSCRIPTION_NAME")

logger = logging.getLogger(__name__)


def start_subscriber() -> None:
    """Start a streaming Pub/Sub pull subscription in a background thread.

    Creates a SubscriberClient and registers process_message as the callback
    for every message on the analytics-subscription subscription. The
    streaming pull runs in a daemon thread so it stops automatically when
    the process exits.
    """
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_NAME)

    def process_message(message) -> None:
        """Decode a Pub/Sub message and log the scan to BigQuery."""
        try:
            data = json.loads(message.data.decode("utf-8"))
            username = data["username"]
            bigquery_client.log_scan(username, None)
            message.ack()
            logger.info("Processed scan event for username=%s", username)
        except Exception as e:
            logger.error("Failed to process Pub/Sub message: %s", e)
            message.ack()

    streaming_pull_future = subscriber.subscribe(subscription_path, callback=process_message)
    logger.info("Listening for Pub/Sub messages on %s", subscription_path)

    def run():
        try:
            streaming_pull_future.result()
        except Exception as e:
            logger.error("Pub/Sub subscriber stopped unexpectedly: %s", e)
            streaming_pull_future.cancel()

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
