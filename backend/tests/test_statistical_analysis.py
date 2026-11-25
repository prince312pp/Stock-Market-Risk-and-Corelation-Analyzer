import numpy as np
import pytest
from src.statistical_analysis import (
    compute_comprehensive_descriptive_statistics,
    compute_confidence_intervals,
    compute_correlation_confidence_interval,
    perform_hypothesis_tests,
    perform_assumption_checks,
    compute_standardized_effect_sizes,
    compute_pairwise_effect_sizes_and_pvalues
)

@pytest.fixture
def sample_returns():
    # Deterministic synthetic return series for testing
    np.random.seed(42)
    return np.random.normal(loc=0.001, scale=0.015, size=200).tolist()

@pytest.fixture
def sample_prices():
    # Deterministic price series
    np.random.seed(42)
    returns = np.random.normal(loc=0.001, scale=0.015, size=200)
    prices = [100.0]
    for r in returns:
        prices.append(prices[-1] * (1.0 + r))
    return prices

def test_descriptive_statistics_bessel_correction(sample_returns):
    stats = compute_comprehensive_descriptive_statistics(sample_returns)
    assert stats["sample_size"] == 200
    # Check that sample variance is strictly Bessel's correction
    arr = np.array(sample_returns)
    expected_var = float(np.var(arr, ddof=1))
    assert abs(stats["sample_variance_ddof1"] - expected_var) < 1e-9
    expected_vol = float(np.std(arr, ddof=1) * np.sqrt(252))
    assert abs(stats["annualized_volatility"] - expected_vol) < 1e-7

def test_confidence_intervals(sample_returns):
    ci = compute_confidence_intervals(sample_returns, confidence=0.95)
    mean_ci = ci["mean_daily_return_ci"]
    vol_ci = ci["annualized_volatility_ci"]
    # Mean CI bounds must bracket the sample mean
    stats = compute_comprehensive_descriptive_statistics(sample_returns)
    assert mean_ci["lower"] < stats["mean_daily_return"] < mean_ci["upper"]
    # Volatility CI bounds must bracket the annualized volatility
    assert vol_ci["lower_pct"] < stats["annualized_volatility_pct"] < vol_ci["upper_pct"]

def test_assumption_checks(sample_prices, sample_returns):
    checks = perform_assumption_checks(sample_prices, sample_returns)
    norm = checks["normality_checks"]
    assert "jarque_bera" in norm
    assert "shapiro_wilk" in norm
    
    stat = checks["stationarity_checks"]
    assert "price_level_adf_statistic" in stat
    assert "return_series_adf_statistic" in stat
    assert stat["return_series_stationary"] is True
    
    serial = checks["autocorrelation_checks"]
    assert 1.0 < serial["durbin_watson_statistic"] < 3.0

def test_standardized_effect_sizes(sample_returns):
    effects = compute_standardized_effect_sizes(sample_returns, risk_free_rate_annual=0.065)
    assert "cohens_d" in effects
    assert "annualized_sharpe_ratio" in effects
    assert isinstance(effects["cohens_d"], float)
    assert isinstance(effects["annualized_sharpe_ratio"], float)

def test_fisher_z_correlation_ci():
    np.random.seed(42)
    x = np.random.normal(0, 1, 150)
    y = 0.6 * x + 0.8 * np.random.normal(0, 1, 150)
    res = compute_correlation_confidence_interval(float(np.corrcoef(x, y)[0, 1]), n=150, confidence=0.95)
    assert 0.4 < res["r"] < 0.8
    assert res["ci_lower"] < res["r"] < res["ci_upper"]
    assert res["sample_size"] == 150
