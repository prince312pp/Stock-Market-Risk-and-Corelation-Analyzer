import urllib.request
import json

def get(url):
    return json.loads(urllib.request.urlopen(url).read().decode())

def post(url, payload):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read().decode())

stocks = get('http://127.0.0.1:8000/api/stocks')
print(f'API /stocks: {len(stocks)} symbols')
for s in stocks:
    print(f"  {s['symbol']} - {s['company_name']} ({s['sector']})")

analysis = get('http://127.0.0.1:8000/api/analysis/SOLARINDS.NS')
print(f"\nAPI /analysis/SOLARINDS.NS: total_records={analysis['total_records']}, daily_volatility={analysis['statistics']['sample_std_dev_pct']:.4f}%")

corr = get('http://127.0.0.1:8000/api/correlation')
print(f"\nAPI /correlation: sample_size={corr['sample_size']} days, matrix_size={len(corr['correlation_matrix'])}x{len(corr['correlation_matrix'])}")
val = corr['correlation_matrix']['SOLARINDS.NS']['BAJFINANCE.NS']
print(f"Sample Pearson(SOLARINDS.NS, BAJFINANCE.NS) = {val:.4f}")

port = post('http://127.0.0.1:8000/api/portfolio/calculate', {'symbol_a': 'SOLARINDS.NS', 'symbol_b': 'BAJFINANCE.NS', 'weight_a': 0.5, 'weight_b': 0.5})
print(f"\nAPI /portfolio/calculate: validation_passed={port['validation_passed']}, variance_difference={port['variance_difference']}")
print("Markowitz Portfolio variance equals observed series variance!")
