import logging
from pymongo import MongoClient, ASCENDING
from pymongo.database import Database
from app.config import MONGODB_URI, DATABASE_NAME
from app.stock_universe import FIXED_STOCKS, VALID_SYMBOLS

logger = logging.getLogger(__name__)

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return _client


def get_db() -> Database:
    client = get_client()
    return client[DATABASE_NAME]


def init_db() -> None:
    """Initialize database indexes and seed stock metadata without inserting fake prices."""
    try:
        db = get_db()
        # Verify connection
        db.command("ping")
        logger.info("Connected to MongoDB at %s, db=%s", MONGODB_URI, DATABASE_NAME)

        # 1. Create compound unique index on prices: (symbol, date)
        prices_col = db["prices"]
        prices_col.create_index(
            [("symbol", ASCENDING), ("date", ASCENDING)],
            unique=True,
            name="uniq_symbol_date",
        )
        logger.info("Created or verified unique index on prices (symbol, date)")

        # 2. Seed stocks collection with metadata only (no prices)
        stocks_col = db["stocks"]
        stocks_col.create_index([("symbol", ASCENDING)], unique=True, name="uniq_symbol")
        stocks_col.delete_many({"symbol": {"$nin": list(VALID_SYMBOLS)}})
        for stock in FIXED_STOCKS:
            stocks_col.update_one(
                {"symbol": stock["symbol"]},
                {"$set": stock},
                upsert=True,
            )
        logger.info("Initialized metadata for %d fixed stocks in MongoDB", len(FIXED_STOCKS))
    except Exception as e:
        logger.error("Failed to initialize database: %s", e)
        raise e


def check_db_health() -> bool:
    try:
        db = get_db()
        db.command("ping")
        return True
    except Exception:
        return False
