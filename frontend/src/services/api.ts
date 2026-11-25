import type {
  StockMetadata,
  StockAnalysisResponse,
  CorrelationResponse,
  PortfolioCalculationRequest,
  PortfolioCalculationResponse,
  BackendHealth,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<BackendHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchStocks(): Promise<StockMetadata[]> {
  const res = await fetch(`${API_BASE}/stocks`);
  if (!res.ok) throw new Error('Failed to fetch stock list');
  return res.json();
}

export async function fetchMarketData(
  symbols: string[],
  startDate?: string,
  endDate?: string
): Promise<{ total_records_stored: number; symbols_processed: Record<string, any> }> {
  const res = await fetch(`${API_BASE}/market-data/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbols,
      start_date: startDate,
      end_date: endDate,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to trigger market data fetch');
  }
  return res.json();
}

export async function fetchStockAnalysis(
  symbol: string,
  startDate?: string,
  endDate?: string,
  priceField: string = 'adjusted_close'
): Promise<StockAnalysisResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (priceField) params.append('price_field', priceField);

  const res = await fetch(`${API_BASE}/analysis/${encodeURIComponent(symbol)}?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch analysis for ${symbol}`);
  }
  return res.json();
}

export async function fetchCorrelation(
  symbols?: string[],
  startDate?: string,
  endDate?: string
): Promise<CorrelationResponse> {
  const params = new URLSearchParams();
  if (symbols && symbols.length > 0) {
    params.append('symbols', symbols.join(','));
  }
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const res = await fetch(`${API_BASE}/correlation?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch correlation matrix');
  }
  return res.json();
}

export async function calculatePortfolio(
  payload: PortfolioCalculationRequest
): Promise<PortfolioCalculationResponse> {
  const res = await fetch(`${API_BASE}/portfolio/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to calculate portfolio metrics');
  }
  return res.json();
}
