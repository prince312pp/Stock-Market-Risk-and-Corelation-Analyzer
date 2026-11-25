import os
import sys
import csv
import json
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import get_db
from app.stock_universe import FIXED_STOCKS
from app.services.statistics_service import calculate_daily_returns, calculate_covariance_and_correlation

db = get_db()

# Create data directories
os.makedirs('data/raw', exist_ok=True)
os.makedirs('data/processed', exist_ok=True)

print("Exporting stocks metadata...")
stocks_cursor = db['stocks'].find({}, {'_id': 0})
stocks_list = list(stocks_cursor)
df_stocks = pd.DataFrame(stocks_list)
df_stocks.to_csv('data/raw/stocks_metadata.csv', index=False)

symbols = [s['symbol'] for s in FIXED_STOCKS]

print("Exporting historical prices...")
prices_cursor = db['prices'].find(
    {'symbol': {'$in': symbols}},
    {'_id': 0, 'symbol': 1, 'date': 1, 'open': 1, 'high': 1, 'low': 1, 'close': 1, 'adjusted_close': 1, 'volume': 1, 'source': 1}
).sort([('symbol', 1), ('date', 1)])
prices_list = list(prices_cursor)
df_prices = pd.DataFrame(prices_list)
df_prices.to_csv('data/raw/historical_prices.csv', index=False)

print("Computing and exporting daily returns...")
returns_rows = []
return_series_dict = {}
for sym in symbols:
    stock_prices = [p for p in prices_list if p['symbol'] == sym]
    stock_prices = sorted(stock_prices, key=lambda x: x['date'])
    calc_records, _ = calculate_daily_returns(stock_prices)
    
    date_map = {}
    for rec in calc_records:
        returns_rows.append({
            'symbol': sym,
            'date': rec['date'],
            'prev_close': rec['prev_close'],
            'current_close': rec['current_close'],
            'return_value': rec['return_value'],
            'return_pct': rec['return_pct']
        })
        date_map[rec['date']] = rec['return_value']
    return_series_dict[sym] = date_map

df_returns = pd.DataFrame(returns_rows)
df_returns.to_csv('data/processed/daily_returns.csv', index=False)

print("Computing and exporting correlation & covariance matrices...")
n, date_range, corr_matrix, cov_matrix = calculate_covariance_and_correlation(return_series_dict, all_symbols=symbols)

df_corr = pd.DataFrame(corr_matrix)
df_corr.to_csv('data/processed/correlation_matrix.csv')

df_cov = pd.DataFrame(cov_matrix)
df_cov.to_csv('data/processed/covariance_matrix.csv')

print(f"Data export completed successfully!")
print(f"  - data/raw/stocks_metadata.csv: {len(df_stocks)} records")
print(f"  - data/raw/historical_prices.csv: {len(df_prices)} records")
print(f"  - data/processed/daily_returns.csv: {len(df_returns)} records")
print(f"  - data/processed/correlation_matrix.csv: {df_corr.shape}")
print(f"  - data/processed/covariance_matrix.csv: {df_cov.shape}")
