import pytest
import math
import numpy as np
from app.services.statistics_service import (
    calculate_daily_returns,
    calculate_descriptive_statistics,
    calculate_covariance_and_correlation,
)


def test_calculate_daily_returns():
    # Small test dataset of 4 prices
    prices = [
        {"date": "2026-01-01", "close": 100.0, "adjusted_close": 100.0},
        {"date": "2026-01-02", "close": 110.0, "adjusted_close": 110.0},  # +10%
        {"date": "2026-01-03", "close": 104.5, "adjusted_close": 104.5},  # -5%
        {"date": "2026-01-04", "close": 109.725, "adjusted_close": 109.725},  # +5%
    ]

    records, raw = calculate_daily_returns(prices)

    # 4 prices -> 3 returns (first day has no return)
    assert len(records) == 3
    assert len(raw) == 3

    assert math.isclose(raw[0], 0.10, rel_tol=1e-5)
    assert math.isclose(raw[1], -0.05, rel_tol=1e-5)
    assert math.isclose(raw[2], 0.05, rel_tol=1e-5)

    assert records[0]["date"] == "2026-01-02"
    assert records[0]["prev_close"] == 100.0
    assert records[0]["current_close"] == 110.0
    assert records[0]["return_pct"] == 10.0


def test_calculate_descriptive_statistics():
    # Known dataset of returns: [0.02, -0.01, 0.03, 0.00]
    returns = [0.02, -0.01, 0.03, 0.00]
    n = 4
    # Mean: (0.02 - 0.01 + 0.03 + 0.00) / 4 = 0.04 / 4 = 0.01
    expected_mean = 0.01
    # Deviations from mean: (0.01, -0.02, 0.02, -0.01)
    # Squared dev: 0.0001 + 0.0004 + 0.0004 + 0.0001 = 0.0010
    # Sample variance (ddof=1): 0.0010 / (4 - 1) = 0.0010 / 3 = 0.00033333...
    expected_var = 0.0010 / 3.0
    expected_std = math.sqrt(expected_var)
    expected_ann_vol = expected_std * math.sqrt(252)

    stats = calculate_descriptive_statistics(returns)
    assert stats is not None
    assert stats["sample_size"] == n
    assert math.isclose(stats["mean_daily_return"], expected_mean, rel_tol=1e-5)
    assert math.isclose(stats["sample_variance"], expected_var, rel_tol=1e-5)
    assert math.isclose(stats["sample_std_dev"], expected_std, rel_tol=1e-5)
    assert math.isclose(stats["annualized_volatility"], expected_ann_vol, rel_tol=1e-5)


def test_covariance_and_correlation():
    # Two stocks with known aligned returns
    # Stock A: [0.01, 0.02, -0.01] -> mean = 0.02/3
    # Stock B: [0.02, 0.04, -0.02] -> exactly 2 * Stock A, perfectly correlated (rho = 1.0)
    returns_series = {
        "SOLARINDS.NS": {
            "2026-01-02": 0.01,
            "2026-01-03": 0.02,
            "2026-01-04": -0.01,
        },
        "TCS.NS": {
            "2026-01-02": 0.02,
            "2026-01-03": 0.04,
            "2026-01-04": -0.02,
        },
    }

    n, date_range, corr, cov = calculate_covariance_and_correlation(returns_series)
    assert n == 3
    assert date_range["start"] == "2026-01-02"
    assert date_range["end"] == "2026-01-04"

    # Perfect correlation
    assert math.isclose(corr["SOLARINDS.NS"]["TCS.NS"], 1.0, rel_tol=1e-4)
    assert math.isclose(corr["SOLARINDS.NS"]["SOLARINDS.NS"], 1.0, rel_tol=1e-4)
    # Covariance between A and 2A = 2 * Var(A)
    var_a = np.var([0.01, 0.02, -0.01], ddof=1)
    assert math.isclose(cov["SOLARINDS.NS"]["TCS.NS"], 2 * var_a, rel_tol=1e-5)
