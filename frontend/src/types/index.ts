export interface StockMetadata {
  symbol: string;
  company_name: string;
  sector: string;
  exchange: string;
}

export interface PriceRecord {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjusted_close: number;
  volume: number;
  source: string;
}

export interface DailyReturnRecord {
  date: string;
  prev_close: number;
  current_close: number;
  return_value: number;
  return_pct: number;
}

export interface DescriptiveStatistics {
  sample_size: number;
  mean_daily_return: number;
  mean_daily_return_pct: number;
  sample_variance: number;
  sample_std_dev: number;
  sample_std_dev_pct: number;
  annualized_volatility: number;
  annualized_volatility_pct: number;
  annualized_mean_return: number;
  annualized_mean_return_pct: number;
  price_field_used: string;
}

export interface StockAnalysisResponse {
  symbol: string;
  metadata: StockMetadata;
  date_range: {
    start: string | null;
    end: string | null;
  };
  total_records: number;
  statistics: DescriptiveStatistics | null;
  returns_preview: DailyReturnRecord[];
  prices: PriceRecord[];
  formula_explanation: Record<string, any>;
}

export interface CorrelationResponse {
  symbols: string[];
  sample_size: number;
  common_date_range: {
    start: string | null;
    end: string | null;
  };
  correlation_matrix: Record<string, Record<string, number | null>>;
  covariance_matrix: Record<string, Record<string, number | null>>;
  interpretation: Record<string, string>;
}

export interface PortfolioCalculationRequest {
  symbol_a: string;
  symbol_b: string;
  weight_a: number;
  weight_b: number;
  start_date?: string;
  end_date?: string;
}

export interface ComparisonChartItem {
  name: string;
  symbol: string;
  weight_pct: number;
  daily_volatility_pct: number;
  annualized_volatility_pct: number;
  daily_mean_return_pct: number;
  annualized_return_pct: number;
  type: string;
}

export interface PortfolioCalculationResponse {
  stock_a: StockMetadata;
  stock_b: StockMetadata;
  weight_a: number;
  weight_b: number;
  sample_size: number;
  aligned_date_range: {
    start: string | null;
    end: string | null;
  };
  mean_return_a: number;
  mean_return_b: number;
  variance_a: number;
  variance_b: number;
  std_dev_a: number;
  std_dev_b: number;
  annualized_vol_a: number;
  annualized_vol_b: number;
  covariance: number;
  correlation: number;
  portfolio_mean_daily_return: number;
  portfolio_mean_annualized_return: number;
  portfolio_variance: number;
  portfolio_std_dev: number;
  portfolio_annualized_volatility: number;
  observed_portfolio_variance: number;
  observed_portfolio_std_dev: number;
  variance_difference: number;
  validation_passed: boolean;
  formula_breakdown: Record<string, any>;
  comparison_chart_data: ComparisonChartItem[];
}

export interface BackendHealth {
  status: string;
  database_connected: boolean;
  database_engine: string;
  latest_market_data_date: string | null;
  fixed_stocks_count: number;
}
