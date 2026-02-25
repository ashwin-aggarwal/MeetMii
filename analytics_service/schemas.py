"""
Pydantic schemas for the MeetMii analytics service.

- ScanEvent: Input body for POST /analytics/scan. Represents a single
             QR code scan to be logged in BigQuery.

- ScanStatsResponse: Output for the stats endpoint. Summarises scan
                     counts for a given username across different time
                     windows.
"""

from typing import Optional
from pydantic import BaseModel


class ScanEvent(BaseModel):
    """Input schema for logging a QR code scan."""

    username: str
    ip_address: Optional[str] = None


class ScanStatsResponse(BaseModel):
    """Output schema for scan statistics for a given username."""

    username: str
    total_scans: int
    scans_this_week: int
    scans_this_month: int
