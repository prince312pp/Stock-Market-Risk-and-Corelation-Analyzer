import pytest
import math
from app.services.portfolio_service import calculate_two_stock_portfolio


def test_portfolio_calculation_and_variance_validation():
    # Setup test return series on 5 common dates
    dates = ["2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06"]
    returns_a = {
        "2026-01-02": 0.015,
        "2026-01-03": -0.010,
        "2026-01-04": 0.025,
        "2026-01-05": 0.005,
        "2026-01-06": -0.020,
    }
    returns_b = {
        "2026-01-02": 0.005,
        "2026-01-03": 0.012,
        "2026-01-04": -0.008,
        "2026-01-05": 0.015,
        "2026-01-06": -0.005,
    }

    # Weights: 60% Stock A, 40% Stock B
    w1, w2 = 0.6, 0.4

    result = calculate_two_stock_portfolio(
        symbol_a="SOLARINDS.NS",
        symbol_b="TCS.NS",
        weight_a=w1,
        weight_b=w2,
        returns_a=returns_a,
        returns_b=returns_b,
    )

    assert result.sample_size == 5
    assert result.validation_passed is True
    # Verify theoretical formula variance matches observed portfolio return sample variance within 1e-6
    assert abs(result.portfolio_variance - result.observed_portfolio_variance) < 1e-6
    assert abs(result.portfolio_std_dev - result.observed_portfolio_std_dev) < 1e-6

    # Verify expected portfolio return: mu_p = w1*mu1 + w2*mu2
    expected_mu = w1 * result.mean_return_a + w2 * result.mean_return_b
    assert math.isclose(result.portfolio_mean_daily_return, expected_mu, rel_tol=1e-5)


def test_portfolio_boundary_weights():
    # Test 100% Stock A, 0% Stock B
    returns_a = {"2026-01-02": 0.01, "2026-01-03": 0.02, "2026-01-04": -0.01}
    returns_b = {"2026-01-02": 0.03, "2026-01-03": -0.01, "2026-01-04": 0.00}

    result = calculate_two_stock_portfolio(
        symbol_a="INFY.NS",
        symbol_b="BAJFINANCE.NS",
        weight_a=1.0,
        weight_b=0.0,
        returns_a=returns_a,
        returns_b=returns_b,
    )

    # When weight_a = 1.0, portfolio variance equals stock A's variance
    assert math.isclose(result.portfolio_variance, result.variance_a, rel_tol=1e-5)
    assert math.isclose(result.portfolio_std_dev, result.std_dev_a, rel_tol=1e-5)
    assert result.validation_passed is True
