import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.statistics_service import (
    calculate_daily_returns,
    calculate_descriptive_statistics,
    calculate_covariance_and_correlation,
    interpret_correlation,
)

__all__ = [
    "calculate_daily_returns",
    "calculate_descriptive_statistics",
    "calculate_covariance_and_correlation",
    "interpret_correlation",
]
