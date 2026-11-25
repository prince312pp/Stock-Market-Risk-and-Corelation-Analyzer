from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.stock_universe import is_valid_symbol
from app.services.market_data_service import (
    fetch_and_store_historical_data,
    get_prices_from_db,
    get_latest_market_date,
)
from app.schemas.analysis import MarketDataFetchRequest, PriceRecord

router = APIRouter()


@router.post("/market-data/fetch")
def fetch_market_data(payload: MarketDataFetchRequest):
    """
    Fetches real historical OHLCV data using yfinance for requested approved symbols
    and upserts into MongoDB.
    """
    # Validate symbols
    invalid_symbols = [s for s in payload.symbols if not is_valid_symbol(s)]
    if invalid_symbols:
        raise HTTPException(
            status_code=400,
            detail=f"The following symbols are not in the approved fixed stock universe: {invalid_symbols}",
        )

    result = fetch_and_store_historical_data(
        symbols=payload.symbols,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    return result


@router.get("/market-data/latest-date")
def get_latest_date():
    """Returns the most recent date available in the database."""
    date_val = get_latest_market_date()
    return {"latest_date": date_val}


@router.get("/market-data/{symbol}", response_model=List[PriceRecord])
def get_stock_price_history(
    symbol: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Returns stored historical prices from MongoDB for the given symbol."""
    if not is_valid_symbol(symbol):
        raise HTTPException(
            status_code=400,
            detail=f"Symbol '{symbol}' is not part of the approved fixed stock universe.",
        )

    prices = get_prices_from_db(symbol=symbol, start_date=start_date, end_date=end_date)
    return [PriceRecord(**p) for p in prices]
