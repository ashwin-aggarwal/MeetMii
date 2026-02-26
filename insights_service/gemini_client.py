"""
Gemini AI client for the MeetMii insights service.

Uses google-generativeai to generate short, personalized weekly
networking insights for each user based on their scan data.
"""

import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3-flash-preview")

logger = logging.getLogger(__name__)

DEFAULT_INSIGHT = (
    "Keep sharing your MeetMii card — every connection starts with a scan!"
)


def generate_insight(username: str, scan_data: dict) -> str:
    """Generate a short personalized weekly insight for a user using Gemini.

    Builds a prompt from the user's weekly scan statistics and calls the
    gemini-1.5-flash model. Returns the generated text on success. If the
    API call fails for any reason, returns a safe default message so the
    pipeline never breaks.

    Args:
        username:  The MeetMii username the insight is for.
        scan_data: Dict with keys total_scans_this_week, total_scans_last_week,
                   busiest_day, and busiest_hour.

    Returns:
        A plain-text insight string (2-3 sentences).
    """
    prompt = f"""You are a networking coach for a professional networking app called MeetMii. \
Generate a short, friendly, personalized weekly insight for user {username} based on their QR code scan data.

Their data this week:
- Total scans this week: {scan_data['total_scans_this_week']}
- Total scans last week: {scan_data['total_scans_last_week']}
- Busiest day: {scan_data['busiest_day'] or 'N/A'}
- Busiest hour: {scan_data['busiest_hour']}:00

Write 2-3 sentences. Be encouraging, specific, and actionable. \
Do not use bullet points. Do not use markdown. Just plain conversational text."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error("Gemini generation failed for username=%s: %s", username, e)
        return DEFAULT_INSIGHT
