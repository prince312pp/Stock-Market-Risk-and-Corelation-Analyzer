"""
Stock Market Risk & Correlation Analyzer - Python Core Source Package (src)
Exposes quantitative financial algorithms, portfolio models, and data pipelines.
"""

import sys
from pathlib import Path

# Ensure backend directory is accessible for app modules
_backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from app.config import RANDOM_SEED, MONGODB_URI, DATABASE_NAME
from app.stock_universe import FIXED_STOCKS, VALID_SYMBOLS, is_valid_symbol, get_stock_metadata
from app.services.statistics_service import (
    calculate_daily_returns,
    calculate_descriptive_statistics,
    calculate_covariance_and_correlation,
    interpret_correlation,
)
from app.services.portfolio_service import calculate_two_stock_portfolio
from app.services.market_data_service import (
    fetch_and_store_historical_data,
    get_prices_from_db,
    get_latest_market_date,
)

__all__ = [
    "RANDOM_SEED",
    "MONGODB_URI",
    "DATABASE_NAME",
    "FIXED_STOCKS",
    "VALID_SYMBOLS",
    "is_valid_symbol",
    "get_stock_metadata",
    "calculate_daily_returns",
    "calculate_descriptive_statistics",
    "calculate_covariance_and_correlation",
    "interpret_correlation",
    "calculate_two_stock_portfolio",
    "fetch_and_store_historical_data",
    "get_prices_from_db",
    "get_latest_market_date",
]
