from fastapi import APIRouter
from app.stock_universe import FIXED_STOCKS
from app.schemas.analysis import StockMetadata

router = APIRouter()


@router.get("/stocks", response_model=list[StockMetadata])
def get_stock_universe():
    """Returns the canonical fixed universe of 10 approved NSE stocks."""
    return [StockMetadata(**stock) for stock in FIXED_STOCKS]
