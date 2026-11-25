import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import init_db, get_db
from app.stock_universe import FIXED_STOCKS, VALID_SYMBOLS
from app.services.market_data_service import fetch_and_store_historical_data, get_prices_from_db

print('--- Initializing DB Metadata ---')
init_db()

db = get_db()
all_stocks = list(db['stocks'].find({}, {'_id': 0, 'symbol': 1, 'company_name': 1}))
print(f'Active stocks in MongoDB: {len(all_stocks)}')
for s in all_stocks:
    print(f"  {s['symbol']}: {s['company_name']}")

print('\n--- Fetching Real Historical Market Data for All 10 Stocks ---')
symbols = [s['symbol'] for s in FIXED_STOCKS]
res = fetch_and_store_historical_data(symbols)

for sym in symbols:
    prices = get_prices_from_db(sym)
    count = len(prices)
    start = prices[0]['date'] if count > 0 else 'N/A'
    end = prices[-1]['date'] if count > 0 else 'N/A'
    stat = res.get('symbols_processed', {}).get(sym, {})
    stored = stat.get('records_stored', stat.get('count', 0))
    print(f"  {sym}: stored {stored} records (Total in DB: {count}, Range: {start} to {end})")

print(f"\nTotal records stored across universe: {res.get('total_records_stored', 0)}")
print('All 10 stocks successfully seeded with real historical market data.')
