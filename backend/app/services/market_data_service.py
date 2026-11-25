import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import yfinance as yf
from pymongo.database import Database
from app.database import get_db
from app.stock_universe import is_valid_symbol, FIXED_STOCKS

logger = logging.getLogger(__name__)


def fetch_and_store_historical_data(
    symbols: List[str],
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Fetches daily historical OHLCV data using yfinance for approved symbols.
    Upserts observations into MongoDB collection 'prices' with BSON Date to prevent duplicates.
    Does NOT invent or fabricate fake prices.
    Returns status summary with counts.
    """
    db = get_db()
    prices_col = db["prices"]

    results = {}
    total_stored = 0

    # Default to 1 year back if start_date not given
    if not start_date:
        one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
        start_date = one_year_ago.strftime("%Y-%m-%d")

    # In yfinance, 'end' is exclusive. If end_date is specified, add 1 day so the selected date is included
    yf_end_date = None
    if end_date:
        try:
            parsed_end = datetime.strptime(end_date, "%Y-%m-%d")
            yf_end_date = (parsed_end + timedelta(days=1)).strftime("%Y-%m-%d")
        except ValueError:
            yf_end_date = end_date

    for symbol in symbols:
        if not is_valid_symbol(symbol):
            results[symbol] = {
                "status": "error",
                "message": f"Symbol '{symbol}' is not part of the approved fixed stock universe.",
                "count": 0,
            }
            continue

        try:
            logger.info("Fetching data for %s from %s to %s", symbol, start_date, yf_end_date or "latest")
            ticker = yf.Ticker(symbol)
            # Use auto_adjust=False to retrieve both Close and Adj Close
            hist = ticker.history(start=start_date, end=yf_end_date, auto_adjust=False)

            if hist.empty:
                results[symbol] = {
                    "status": "warning",
                    "message": "No historical data returned from Yahoo Finance for the specified range.",
                    "count": 0,
                }
                continue

            symbol_stored = 0
            for idx, row in hist.iterrows():
                # idx is a Timestamp (may be tz-aware)
                if hasattr(idx, "to_pydatetime"):
                    dt = idx.to_pydatetime()
                else:
                    dt = idx

                # Normalize to naive UTC date at 00:00:00 for clean BSON Date storage
                bson_date = datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc)

                close_val = float(row.get("Close", 0.0))
                adj_close_val = float(row.get("Adj Close", close_val))
                open_val = float(row.get("Open", 0.0))
                high_val = float(row.get("High", 0.0))
                low_val = float(row.get("Low", 0.0))
                volume_val = int(row.get("Volume", 0))

                doc = {
                    "symbol": symbol,
                    "date": bson_date,
                    "open": round(open_val, 4),
                    "high": round(high_val, 4),
                    "low": round(low_val, 4),
                    "close": round(close_val, 4),
                    "adjusted_close": round(adj_close_val, 4),
                    "volume": volume_val,
                    "source": "Yahoo Finance",
                }

                # Upsert into MongoDB
                prices_col.update_one(
                    {"symbol": symbol, "date": bson_date},
                    {"$set": doc},
                    upsert=True,
                )
                symbol_stored += 1

            total_stored += symbol_stored
            results[symbol] = {
                "status": "success",
                "count": symbol_stored,
                "first_date": hist.index[0].strftime("%Y-%m-%d"),
                "latest_date": hist.index[-1].strftime("%Y-%m-%d"),
            }

        except Exception as e:
            logger.error("Error fetching historical data for %s: %s", symbol, e)
            results[symbol] = {
                "status": "error",
                "message": f"Failed to retrieve data from Yahoo Finance: {str(e)}",
                "count": 0,
            }

    return {
        "total_records_stored": total_stored,
        "symbols_processed": results,
    }


def get_prices_from_db(
    symbol: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieves stored prices from MongoDB sorted by date ascending.
    """
    db = get_db()
    prices_col = db["prices"]

    query: Dict[str, Any] = {"symbol": symbol}

    date_filter: Dict[str, Any] = {}
    if isinstance(start_date, str) and start_date.strip():
        try:
            st = datetime.strptime(start_date.strip(), "%Y-%m-%d").replace(tzinfo=timezone.utc)
            date_filter["$gte"] = st
        except ValueError:
            pass

    if isinstance(end_date, str) and end_date.strip():
        try:
            ed = datetime.strptime(end_date.strip(), "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            date_filter["$lte"] = ed
        except ValueError:
            pass

    if date_filter:
        query["date"] = date_filter

    cursor = prices_col.find(query).sort("date", 1)

    prices = []
    for doc in cursor:
        dt = doc["date"]
        date_str = dt.strftime("%Y-%m-%d") if isinstance(dt, datetime) else str(dt)[:10]
        prices.append(
            {
                "symbol": doc["symbol"],
                "date": date_str,
                "open": doc["open"],
                "high": doc["high"],
                "low": doc["low"],
                "close": doc["close"],
                "adjusted_close": doc.get("adjusted_close", doc["close"]),
                "volume": doc["volume"],
                "source": doc.get("source", "Yahoo Finance"),
            }
        )

    return prices


def get_latest_market_date() -> Optional[str]:
    """Finds the most recent date stored in prices collection across all stocks."""
    db = get_db()
    latest_doc = db["prices"].find_one({}, sort=[("date", -1)])
    if latest_doc and "date" in latest_doc:
        dt = latest_doc["date"]
        return dt.strftime("%Y-%m-%d") if isinstance(dt, datetime) else str(dt)[:10]
    return None
