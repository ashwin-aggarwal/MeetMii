"""
Pub/Sub publisher for the MeetMii profile service.

Publishes a scan event message to the qr-scanned topic every time a public
profile is viewed. Failures are logged but never propagate to the caller
so the profile is always returned to the user.
"""

import os
import json
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv
from google.cloud import pubsub_v1

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
TOPIC_NAME = os.getenv("PUBSUB_TOPIC_NAME")

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_NAME)

logger = logging.getLogger(__name__)


def publish_scan_event(username: str) -> None:
    """Publish a scan event message to the qr-scanned Pub/Sub topic.

    Builds a JSON message containing the username and the current UTC
    timestamp, then publishes it asynchronously. Any exception from
    Pub/Sub is caught and logged so the profile response is never blocked
    or delayed by a publish failure.
    """
    try:
        message = {
            "username": username,
            "scanned_at": datetime.now(timezone.utc).isoformat(),
        }
        data = json.dumps(message).encode("utf-8")
        future = publisher.publish(topic_path, data)
        future.result()
        logger.info("Published scan event for username=%s", username)
    except Exception as e:
        logger.error("Failed to publish scan event for username=%s: %s", username, e)
