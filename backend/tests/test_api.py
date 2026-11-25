import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.stock_universe import FIXED_STOCKS

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["fixed_stocks_count"] == 10
    assert data["database_engine"] == "MongoDB"


def test_fixed_stock_universe():
    response = client.get("/api/stocks")
    assert response.status_code == 200
    stocks = response.json()
    assert len(stocks) == 10
    symbols = [s["symbol"] for s in stocks]
    assert "SOLARINDS.NS" in symbols
    assert "BAJFINANCE.NS" in symbols
    assert "TITAN.NS" in symbols
    assert "EICHERMOT.NS" in symbols
    assert "PIDILITIND.NS" in symbols
    assert "INFY.NS" in symbols
    assert "TCS.NS" in symbols
    assert "ASIANPAINT.NS" in symbols
    assert "AJANTPHARM.NS" in symbols
    assert "HAVELLS.NS" in symbols


def test_invalid_symbol_rejection():
    # Attempt to query unapproved ticker
    response = client.get("/api/market-data/AAPL")
    assert response.status_code == 400
    assert "not part of the approved fixed stock universe" in response.json()["detail"]

    response = client.get("/api/analysis/INVALID_TICKER")
    assert response.status_code == 400


def test_portfolio_weight_validation():
    # Weights summing to != 1.0
    payload = {
        "symbol_a": "SOLARINDS.NS",
        "symbol_b": "TCS.NS",
        "weight_a": 0.6,
        "weight_b": 0.5,  # Sum = 1.1 -> invalid
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 400
    assert "must sum to 100%" in response.json()["detail"]


def test_portfolio_identical_symbols_rejection():
    payload = {
        "symbol_a": "SOLARINDS.NS",
        "symbol_b": "SOLARINDS.NS",
        "weight_a": 0.5,
        "weight_b": 0.5,
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 400
    assert "two distinct stocks" in response.json()["detail"]
