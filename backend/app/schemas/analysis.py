from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class StockMetadata(BaseModel):
    symbol: str
    company_name: str
    sector: str
    exchange: str


class MarketDataFetchRequest(BaseModel):
    symbols: List[str] = Field(..., description="List of stock symbols to fetch")
    start_date: Optional[str] = Field(None, description="Start date in YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="End date in YYYY-MM-DD")


class PriceRecord(BaseModel):
    symbol: str
    date: str
    open: float
    high: float
    low: float
    close: float
    adjusted_close: float
    volume: int
    source: str = "Yahoo Finance"


class DailyReturnRecord(BaseModel):
    date: str
    prev_close: float
    current_close: float
    return_value: float
    return_pct: float


class DescriptiveStatistics(BaseModel):
    sample_size: int
    mean_daily_return: float
    mean_daily_return_pct: float
    sample_variance: float
    sample_std_dev: float
    sample_std_dev_pct: float
    annualized_volatility: float
    annualized_volatility_pct: float
    annualized_mean_return: float
    annualized_mean_return_pct: float
    price_field_used: str = "adjusted_close"


class StockAnalysisResponse(BaseModel):
    symbol: str
    metadata: StockMetadata
    date_range: Dict[str, Optional[str]]
    total_records: int
    statistics: Optional[DescriptiveStatistics] = None
    returns_preview: List[DailyReturnRecord] = []
    prices: List[PriceRecord] = []
    formula_explanation: Dict[str, Any] = {}


class CorrelationResponse(BaseModel):
    symbols: List[str]
    sample_size: int
    common_date_range: Dict[str, Optional[str]]
    correlation_matrix: Dict[str, Dict[str, Optional[float]]]
    covariance_matrix: Dict[str, Dict[str, Optional[float]]]
    interpretation: Dict[str, str] = {}


class PortfolioCalculationRequest(BaseModel):
    symbol_a: str
    symbol_b: str
    weight_a: float = Field(..., ge=0.0, le=1.0)
    weight_b: float = Field(..., ge=0.0, le=1.0)
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class PortfolioCalculationResponse(BaseModel):
    stock_a: StockMetadata
    stock_b: StockMetadata
    weight_a: float
    weight_b: float
    sample_size: int
    aligned_date_range: Dict[str, Optional[str]]
    mean_return_a: float
    mean_return_b: float
    variance_a: float
    variance_b: float
    std_dev_a: float
    std_dev_b: float
    annualized_vol_a: float
    annualized_vol_b: float
    covariance: float
    correlation: float
    portfolio_mean_daily_return: float
    portfolio_mean_annualized_return: float
    portfolio_variance: float
    portfolio_std_dev: float
    portfolio_annualized_volatility: float
    observed_portfolio_variance: float
    observed_portfolio_std_dev: float
    variance_difference: float
    validation_passed: bool
    formula_breakdown: Dict[str, Any]
    comparison_chart_data: List[Dict[str, Any]]
