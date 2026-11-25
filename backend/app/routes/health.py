from fastapi import APIRouter
from app.database import check_db_health
from app.services.market_data_service import get_latest_market_date

router = APIRouter()


@router.get("/health")
def get_health():
    db_ok = check_db_health()
    latest_date = get_latest_market_date() if db_ok else None
    return {
        "status": "healthy" if db_ok else "degraded",
        "database_connected": db_ok,
        "database_engine": "MongoDB",
        "latest_market_data_date": latest_date,
        "fixed_stocks_count": 10,
    }
