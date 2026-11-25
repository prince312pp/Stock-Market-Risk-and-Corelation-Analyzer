from typing import Dict, List, Optional

# Exactly the 10 approved historically strong-performing NSE stocks
FIXED_STOCKS: List[Dict[str, str]] = [
    {
        "symbol": "SOLARINDS.NS",
        "company_name": "Solar Industries India",
        "sector": "Chemicals & Explosives",
        "exchange": "NSE",
    },
    {
        "symbol": "BAJFINANCE.NS",
        "company_name": "Bajaj Finance",
        "sector": "Financial Services",
        "exchange": "NSE",
    },
    {
        "symbol": "TITAN.NS",
        "company_name": "Titan Company",
        "sector": "Consumer Discretionary",
        "exchange": "NSE",
    },
    {
        "symbol": "EICHERMOT.NS",
        "company_name": "Eicher Motors",
        "sector": "Automobile",
        "exchange": "NSE",
    },
    {
        "symbol": "PIDILITIND.NS",
        "company_name": "Pidilite Industries",
        "sector": "Chemicals & Adhesives",
        "exchange": "NSE",
    },
    {
        "symbol": "INFY.NS",
        "company_name": "Infosys",
        "sector": "IT",
        "exchange": "NSE",
    },
    {
        "symbol": "TCS.NS",
        "company_name": "Tata Consultancy Services",
        "sector": "IT",
        "exchange": "NSE",
    },
    {
        "symbol": "ASIANPAINT.NS",
        "company_name": "Asian Paints",
        "sector": "Consumer Goods & Paints",
        "exchange": "NSE",
    },
    {
        "symbol": "AJANTPHARM.NS",
        "company_name": "Ajanta Pharma",
        "sector": "Pharmaceuticals",
        "exchange": "NSE",
    },
    {
        "symbol": "HAVELLS.NS",
        "company_name": "Havells India",
        "sector": "Consumer Electricals",
        "exchange": "NSE",
    },
]

VALID_SYMBOLS = {stock["symbol"] for stock in FIXED_STOCKS}
SYMBOL_TO_STOCK = {stock["symbol"]: stock for stock in FIXED_STOCKS}


def is_valid_symbol(symbol: str) -> bool:
    return symbol in VALID_SYMBOLS


def get_stock_metadata(symbol: str) -> Optional[Dict[str, str]]:
    return SYMBOL_TO_STOCK.get(symbol)
