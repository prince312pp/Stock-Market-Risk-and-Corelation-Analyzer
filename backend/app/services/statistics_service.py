import math
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd


def calculate_daily_returns(
    prices: List[Dict[str, Any]], price_field: str = "adjusted_close"
) -> Tuple[List[Dict[str, Any]], List[float]]:
    """
    Calculates simple daily returns from ordered price observations:
    R_t = (P_t - P_{t-1}) / P_{t-1}
    Day 0 has no previous price and thus no return. It is omitted (not zero-filled).
    Returns (return_records, raw_return_values).
    """
    if len(prices) < 2:
        return [], []

    # Ensure prices are sorted by date ascending
    sorted_prices = sorted(prices, key=lambda x: x["date"])

    return_records: List[Dict[str, Any]] = []
    raw_returns: List[float] = []

    for i in range(1, len(sorted_prices)):
        prev_price = float(sorted_prices[i - 1].get(price_field) or sorted_prices[i - 1]["close"])
        curr_price = float(sorted_prices[i].get(price_field) or sorted_prices[i]["close"])
        dt_str = (
            sorted_prices[i]["date"].strftime("%Y-%m-%d")
            if hasattr(sorted_prices[i]["date"], "strftime")
            else str(sorted_prices[i]["date"])[:10]
        )

        if prev_price <= 0:
            continue

        ret_val = (curr_price - prev_price) / prev_price
        ret_pct = ret_val * 100.0

        return_records.append(
            {
                "date": dt_str,
                "prev_close": round(prev_price, 4),
                "current_close": round(curr_price, 4),
                "return_value": round(ret_val, 6),
                "return_pct": round(ret_pct, 4),
            }
        )
        raw_returns.append(ret_val)

    return return_records, raw_returns


def calculate_descriptive_statistics(returns: List[float], price_field: str = "adjusted_close") -> Optional[Dict[str, Any]]:
    """
    Calculates:
    - Mean daily return: R_bar = (1/n) * sum(R_t)
    - Sample variance (ddof=1): s^2 = (1/(n-1)) * sum((R_t - R_bar)^2)
    - Sample std dev: s = sqrt(s^2)
    - Annualized volatility: sigma_annual = s * sqrt(252)
    - Annualized mean return (arithmetic): mu_annual = R_bar * 252
    Requires at least 2 return observations for sample variance (ddof=1).
    """
    n = len(returns)
    if n < 2:
        return None

    r_arr = np.array(returns, dtype=np.float64)
    mean_val = float(np.mean(r_arr))
    # Sample variance with ddof=1
    var_val = float(np.var(r_arr, ddof=1))
    std_val = float(np.std(r_arr, ddof=1))
    ann_vol = float(std_val * math.sqrt(252))
    ann_ret = float(mean_val * 252)

    return {
        "sample_size": n,
        "mean_daily_return": round(mean_val, 8),
        "mean_daily_return_pct": round(mean_val * 100.0, 4),
        "sample_variance": round(var_val, 10),
        "sample_std_dev": round(std_val, 8),
        "sample_std_dev_pct": round(std_val * 100.0, 4),
        "annualized_volatility": round(ann_vol, 8),
        "annualized_volatility_pct": round(ann_vol * 100.0, 4),
        "annualized_mean_return": round(ann_ret, 8),
        "annualized_mean_return_pct": round(ann_ret * 100.0, 4),
        "price_field_used": price_field,
    }


def calculate_covariance_and_correlation(
    return_series_by_symbol: Dict[str, Dict[str, float]],
    all_symbols: Optional[List[str]] = None,
) -> Tuple[int, Dict[str, Optional[str]], Dict[str, Dict[str, Optional[float]]], Dict[str, Dict[str, Optional[float]]]]:
    """
    Given a dict: {symbol: {date_str: return_value}},
    Calculates sample covariance (ddof=1) and Pearson correlation for each pair on their common dates.
    Handles stocks with missing or partial data gracefully without zeroing out valid pairs.
    Returns (sample_size, date_range, correlation_matrix, covariance_matrix).
    """
    symbols = all_symbols if all_symbols is not None else list(return_series_by_symbol.keys())
    if not symbols:
        return 0, {"start": None, "end": None}, {}, {}

    # Symbols that have at least 2 observations
    valid_symbols = [s for s in symbols if len(return_series_by_symbol.get(s, {})) >= 2]

    # Find common dates across all valid symbols
    sorted_common = []
    if valid_symbols:
        common_all = set.intersection(*(set(return_series_by_symbol[s].keys()) for s in valid_symbols))
        sorted_common = sorted(list(common_all))

    global_n = len(sorted_common)
    date_range = {
        "start": sorted_common[0] if global_n > 0 else None,
        "end": sorted_common[-1] if global_n > 0 else None,
    }

    cov_dict: Dict[str, Dict[str, Optional[float]]] = {}
    corr_dict: Dict[str, Dict[str, Optional[float]]] = {}

    for s1 in symbols:
        cov_dict[s1] = {}
        corr_dict[s1] = {}
        ret1 = return_series_by_symbol.get(s1, {})

        for s2 in symbols:
            ret2 = return_series_by_symbol.get(s2, {})

            if s1 == s2:
                if len(ret1) >= 2:
                    vals = np.array(list(ret1.values()), dtype=np.float64)
                    var_val = float(np.var(vals, ddof=1))
                    cov_dict[s1][s2] = round(var_val, 8)
                    corr_dict[s1][s2] = 1.0
                else:
                    cov_dict[s1][s2] = None
                    corr_dict[s1][s2] = None
            else:
                # Find intersection of dates for this specific pair
                common_dates_pair = sorted(list(set(ret1.keys()).intersection(set(ret2.keys()))))
                if len(common_dates_pair) >= 2:
                    x = np.array([ret1[d] for d in common_dates_pair], dtype=np.float64)
                    y = np.array([ret2[d] for d in common_dates_pair], dtype=np.float64)
                    x_mean = float(np.mean(x))
                    y_mean = float(np.mean(y))
                    n_pair = len(common_dates_pair)
                    cov_val = float(np.sum((x - x_mean) * (y - y_mean)) / (n_pair - 1))
                    std_x = float(np.std(x, ddof=1))
                    std_y = float(np.std(y, ddof=1))
                    if std_x > 0 and std_y > 0:
                        corr_val = float(cov_val / (std_x * std_y))
                    else:
                        corr_val = 0.0

                    cov_dict[s1][s2] = 0.0 if math.isnan(cov_val) else round(cov_val, 8)
                    corr_dict[s1][s2] = 0.0 if math.isnan(corr_val) else round(corr_val, 4)
                else:
                    cov_dict[s1][s2] = None
                    corr_dict[s1][s2] = None

    return global_n, date_range, corr_dict, cov_dict


def interpret_correlation(corr_val: Optional[float], stock_a: str, stock_b: str) -> str:
    """Provides short plain-language explanation of Pearson correlation coefficient."""
    if corr_val is None:
        return f"Insufficient historical data available for {stock_a} or {stock_b} to calculate correlation."

    if corr_val >= 0.7:
        strength = "Strong positive correlation"
        explanation = f"{stock_a} and {stock_b} tend to move strongly in the same direction on trading days."
    elif corr_val >= 0.3:
        strength = "Moderate positive correlation"
        explanation = f"{stock_a} and {stock_b} show moderate co-movement in the same direction."
    elif corr_val > -0.3:
        strength = "Weak or negligible correlation"
        explanation = f"There is little to no linear relationship between daily returns of {stock_a} and {stock_b}, indicating potential diversification benefits."
    elif corr_val > -0.7:
        strength = "Moderate negative correlation"
        explanation = f"{stock_a} and {stock_b} tend to move in opposite directions on many trading days."
    else:
        strength = "Strong negative correlation"
        explanation = f"{stock_a} and {stock_b} strongly move in opposite directions, providing significant historical offsetting."

    return f"{strength} ({corr_val:.4f}): {explanation}"
