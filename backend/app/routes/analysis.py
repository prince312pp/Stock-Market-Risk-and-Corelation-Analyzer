from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.stock_universe import is_valid_symbol, get_stock_metadata, FIXED_STOCKS
from app.services.market_data_service import get_prices_from_db
from app.services.statistics_service import (
    calculate_daily_returns,
    calculate_descriptive_statistics,
    calculate_covariance_and_correlation,
    interpret_correlation,
)
from app.services.portfolio_service import calculate_two_stock_portfolio
from app.schemas.analysis import (
    StockAnalysisResponse,
    StockMetadata,
    DescriptiveStatistics,
    PriceRecord,
    DailyReturnRecord,
    CorrelationResponse,
    PortfolioCalculationRequest,
    PortfolioCalculationResponse,
)

router = APIRouter()


@router.get("/analysis/{symbol}", response_model=StockAnalysisResponse)
def get_stock_analysis(
    symbol: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    price_field: str = "adjusted_close",
):
    """
    Returns historical prices, calculated simple daily returns, and descriptive statistics
    (mean, sample variance ddof=1, standard deviation, annualized volatility).
    Includes step-by-step formula breakdown with substituted values.
    """
    if not is_valid_symbol(symbol):
        raise HTTPException(
            status_code=400,
            detail=f"Symbol '{symbol}' is not part of the approved fixed stock universe.",
        )

    meta = get_stock_metadata(symbol) or {
        "symbol": symbol,
        "company_name": symbol,
        "sector": "N/A",
        "exchange": "NSE",
    }

    # Fetch stored prices
    prices = get_prices_from_db(symbol=symbol, start_date=start_date, end_date=end_date)
    total_records = len(prices)

    if total_records == 0:
        return StockAnalysisResponse(
            symbol=symbol,
            metadata=StockMetadata(**meta),
            date_range={"start": start_date, "end": end_date},
            total_records=0,
            statistics=None,
            returns_preview=[],
            prices=[],
            formula_explanation={
                "message": "No historical price records found in the database for this date range. Please fetch data first."
            },
        )

    # Calculate daily returns
    return_records, raw_returns = calculate_daily_returns(prices, price_field=price_field)

    stats = None
    formula_explanation = {}
    if len(raw_returns) >= 2:
        calc_stats = calculate_descriptive_statistics(raw_returns, price_field=price_field)
        if calc_stats:
            stats = DescriptiveStatistics(**calc_stats)

            # Build step-by-step presentation explanation
            sample_n = calc_stats["sample_size"]
            mean_r = calc_stats["mean_daily_return"]
            var_s2 = calc_stats["sample_variance"]
            std_s = calc_stats["sample_std_dev"]
            ann_vol = calc_stats["annualized_volatility"]
            ann_ret = calc_stats["annualized_mean_return"]

            formula_explanation = {
                "daily_return": {
                    "formula": "R_t = (P_t - P_{t-1}) / P_{t-1}",
                    "description": "Simple percentage change between consecutive trading day closing prices. Day 0 has no return.",
                },
                "mean_return": {
                    "formula": "R_bar = (1 / n) * sum(R_t)",
                    "n": sample_n,
                    "value": mean_r,
                    "pct": f"{calc_stats['mean_daily_return_pct']:.4f}%",
                    "description": f"Arithmetic average of {sample_n} daily returns.",
                },
                "sample_variance": {
                    "formula": "s² = (1 / (n - 1)) * sum((R_t - R_bar)²)",
                    "ddof": 1,
                    "n_minus_1": sample_n - 1,
                    "value": var_s2,
                    "description": "Sample variance using Bessel's correction (ddof=1) to ensure an unbiased estimator of variance.",
                },
                "standard_deviation": {
                    "formula": "s = sqrt(s²)",
                    "value": std_s,
                    "pct": f"{calc_stats['sample_std_dev_pct']:.4f}%",
                    "description": "Daily sample standard deviation, representing typical dispersion around the mean daily return.",
                },
                "annualized_volatility": {
                    "formula": "σ_annual = s_daily * sqrt(252)",
                    "trading_days": 252,
                    "calculation": f"{std_s:.6f} × sqrt(252) = {ann_vol:.6f}",
                    "pct": f"{calc_stats['annualized_volatility_pct']:.2f}%",
                    "description": "Standardized annual volatility based on the standard 252 trading days per year convention.",
                },
                "annualized_mean_return": {
                    "formula": "μ_annual = R_bar * 252",
                    "calculation": f"{mean_r:.6f} × 252 = {ann_ret:.6f}",
                    "pct": f"{calc_stats['annualized_mean_return_pct']:.2f}%",
                    "description": "Arithmetic annualization of average daily return over 252 trading days. Does not guarantee future performance.",
                },
            }

    date_range = {
        "start": prices[0]["date"] if prices else None,
        "end": prices[-1]["date"] if prices else None,
    }

    return StockAnalysisResponse(
        symbol=symbol,
        metadata=StockMetadata(**meta),
        date_range=date_range,
        total_records=total_records,
        statistics=stats,
        returns_preview=[DailyReturnRecord(**r) for r in return_records],
        prices=[PriceRecord(**p) for p in prices],
        formula_explanation=formula_explanation,
    )


@router.get("/correlation", response_model=CorrelationResponse)
def get_correlation(
    symbols: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """
    Calculates sample covariance and Pearson correlation matrices for selected stocks on common dates.
    """
    if symbols:
        sym_list = [s.strip() for s in symbols.split(",") if s.strip()]
    else:
        sym_list = [s["symbol"] for s in FIXED_STOCKS]

    for s in sym_list:
        if not is_valid_symbol(s):
            raise HTTPException(
                status_code=400,
                detail=f"Symbol '{s}' is not in the approved fixed stock universe.",
            )

    # Gather return series mapped by date
    return_series: dict[str, dict[str, float]] = {}
    for s in sym_list:
        prices = get_prices_from_db(s, start_date=start_date, end_date=end_date)
        _, raw_returns = calculate_daily_returns(prices)
        if len(raw_returns) > 0:
            # Map returns by date (skip day 0)
            sorted_prices = sorted(prices, key=lambda x: x["date"])
            date_ret_map = {}
            for i in range(1, len(sorted_prices)):
                p0 = float(sorted_prices[i - 1].get("adjusted_close") or sorted_prices[i - 1]["close"])
                p1 = float(sorted_prices[i].get("adjusted_close") or sorted_prices[i]["close"])
                dt_str = sorted_prices[i]["date"]
                if p0 > 0:
                    date_ret_map[dt_str] = (p1 - p0) / p0
            return_series[s] = date_ret_map
        else:
            return_series[s] = {}

    n, date_range, corr_matrix, cov_matrix = calculate_covariance_and_correlation(
        return_series, all_symbols=sym_list
    )

    # Generate pairwise interpretations
    interpretations: dict[str, str] = {}
    for i in range(len(sym_list)):
        for j in range(i + 1, len(sym_list)):
            s1 = sym_list[i]
            s2 = sym_list[j]
            pair_key = f"{s1}__{s2}"
            if s1 in corr_matrix and s2 in corr_matrix[s1]:
                c_val = corr_matrix[s1][s2]
                interpretations[pair_key] = interpret_correlation(c_val, s1, s2)

    return CorrelationResponse(
        symbols=sym_list,
        sample_size=n,
        common_date_range=date_range,
        correlation_matrix=corr_matrix,
        covariance_matrix=cov_matrix,
        interpretation=interpretations,
    )


@router.post("/portfolio/calculate", response_model=PortfolioCalculationResponse)
def calculate_portfolio(payload: PortfolioCalculationRequest):
    """
    Calculates expected return and risk for a two-stock portfolio:
    w1, w2 in [0, 1], w1 + w2 == 1.0.
    Validates theoretical formula variance vs observed portfolio return sample variance.
    """
    if not is_valid_symbol(payload.symbol_a) or not is_valid_symbol(payload.symbol_b):
        raise HTTPException(status_code=400, detail="Invalid stock symbol provided.")

    if payload.symbol_a == payload.symbol_b:
        raise HTTPException(
            status_code=400,
            detail="Portfolio calculation requires two distinct stocks. Please select two different stocks.",
        )

    weight_sum = payload.weight_a + payload.weight_b
    if abs(weight_sum - 1.0) > 0.001:
        raise HTTPException(
            status_code=400,
            detail=f"Portfolio weights must sum to 100% (1.0). Current sum: {weight_sum:.4f}",
        )

    # Retrieve prices and calculate return dicts
    prices_a = get_prices_from_db(payload.symbol_a, start_date=payload.start_date, end_date=payload.end_date)
    prices_b = get_prices_from_db(payload.symbol_b, start_date=payload.start_date, end_date=payload.end_date)

    if len(prices_a) < 2 or len(prices_b) < 2:
        raise HTTPException(
            status_code=400,
            detail="Insufficient historical price records stored for one or both selected stocks. Please fetch market data first.",
        )

    # Build return series mapped by date
    def to_date_map(prices_list):
        sorted_p = sorted(prices_list, key=lambda x: x["date"])
        d_map = {}
        for i in range(1, len(sorted_p)):
            p0 = float(sorted_p[i - 1].get("adjusted_close") or sorted_p[i - 1]["close"])
            p1 = float(sorted_p[i].get("adjusted_close") or sorted_p[i]["close"])
            if p0 > 0:
                d_map[sorted_p[i]["date"]] = (p1 - p0) / p0
        return d_map

    returns_a = to_date_map(prices_a)
    returns_b = to_date_map(prices_b)

    try:
        resp = calculate_two_stock_portfolio(
            symbol_a=payload.symbol_a,
            symbol_b=payload.symbol_b,
            weight_a=payload.weight_a,
            weight_b=payload.weight_b,
            returns_a=returns_a,
            returns_b=returns_b,
        )
        return resp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
