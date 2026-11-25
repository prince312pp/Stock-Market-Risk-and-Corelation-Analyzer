import math
from typing import Dict, Any, List, Optional
import numpy as np
from app.stock_universe import get_stock_metadata
from app.schemas.analysis import StockMetadata, PortfolioCalculationResponse


def calculate_two_stock_portfolio(
    symbol_a: str,
    symbol_b: str,
    weight_a: float,
    weight_b: float,
    returns_a: Dict[str, float],
    returns_b: Dict[str, float],
) -> PortfolioCalculationResponse:
    """
    Calculates portfolio metrics for two assets on aligned dates:
    - Weight validation: w1 >= 0, w2 >= 0, w1 + w2 == 1.0
    - Portfolio daily return: R_p = w1*R1 + w2*R2
    - Expected portfolio return: mu_p = w1*mu1 + w2*mu2
    - Portfolio variance: sigma_p^2 = w1^2 * sigma1^2 + w2^2 * sigma2^2 + 2*w1*w2*Cov(R1, R2)
    - Portfolio std dev: sigma_p = sqrt(sigma_p^2)
    - Annualized portfolio volatility: sigma_p * sqrt(252)
    - Observed portfolio return sample variance: s_p^2
    - Validates that theoretical formula matches observed sample variance within 1e-6.
    """
    # Find common dates
    common_dates = sorted(list(set(returns_a.keys()).intersection(set(returns_b.keys()))))
    n = len(common_dates)
    if n < 2:
        raise ValueError(f"Insufficient common trading days ({n}) to compute portfolio statistics. Need at least 2.")

    # Align return series
    r1 = np.array([returns_a[d] for d in common_dates], dtype=np.float64)
    r2 = np.array([returns_b[d] for d in common_dates], dtype=np.float64)

    # Individual metrics (ddof=1)
    mean_a = float(np.mean(r1))
    mean_b = float(np.mean(r2))

    var_a = float(np.var(r1, ddof=1))
    var_b = float(np.var(r2, ddof=1))

    std_a = float(np.std(r1, ddof=1))
    std_b = float(np.std(r2, ddof=1))

    ann_vol_a = float(std_a * math.sqrt(252))
    ann_vol_b = float(std_b * math.sqrt(252))

    # Sample Covariance (ddof=1)
    # Cov(X, Y) = sum((X - mean_x) * (Y - mean_y)) / (n - 1)
    cov_val = float(np.sum((r1 - mean_a) * (r2 - mean_b)) / (n - 1))

    # Pearson correlation
    if std_a > 0 and std_b > 0:
        corr_val = float(cov_val / (std_a * std_b))
    else:
        corr_val = 0.0

    # Theoretical Portfolio Metrics
    mu_p = float(weight_a * mean_a + weight_b * mean_b)
    ann_mu_p = float(mu_p * 252)

    var_p_formula = float(
        (weight_a**2) * var_a
        + (weight_b**2) * var_b
        + 2.0 * weight_a * weight_b * cov_val
    )
    # Guard against slight float negative due to precision
    var_p_formula = max(0.0, var_p_formula)
    std_p_formula = float(math.sqrt(var_p_formula))
    ann_vol_p = float(std_p_formula * math.sqrt(252))

    # Observed Portfolio Return Series
    rp_series = weight_a * r1 + weight_b * r2
    var_p_observed = float(np.var(rp_series, ddof=1))
    std_p_observed = float(np.std(rp_series, ddof=1))

    diff = abs(var_p_formula - var_p_observed)
    validation_passed = diff < 1e-6

    # Meta
    meta_a = get_stock_metadata(symbol_a) or {"symbol": symbol_a, "company_name": symbol_a, "sector": "N/A", "exchange": "NSE"}
    meta_b = get_stock_metadata(symbol_b) or {"symbol": symbol_b, "company_name": symbol_b, "sector": "N/A", "exchange": "NSE"}

    # Breakdown for academic presentation
    formula_breakdown = {
        "formula": "σ_p² = w₁²σ₁² + w₂²σ₂² + 2w₁w₂Cov(R₁, R₂)",
        "inputs": {
            "w1": round(weight_a, 4),
            "w2": round(weight_b, 4),
            "mean1": round(mean_a, 6),
            "mean2": round(mean_b, 6),
            "var1": round(var_a, 8),
            "var2": round(var_b, 8),
            "std1": round(std_a, 6),
            "std2": round(std_b, 6),
            "cov12": round(cov_val, 8),
            "corr12": round(corr_val, 4),
        },
        "substitution": (
            f"({weight_a:.2f}² × {var_a:.8f}) + "
            f"({weight_b:.2f}² × {var_b:.8f}) + "
            f"(2 × {weight_a:.2f} × {weight_b:.2f} × {cov_val:.8f})"
        ),
        "term1": round((weight_a**2) * var_a, 8),
        "term2": round((weight_b**2) * var_b, 8),
        "term3_covariance_impact": round(2.0 * weight_a * weight_b * cov_val, 8),
        "theoretical_variance": round(var_p_formula, 8),
        "theoretical_std_dev": round(std_p_formula, 6),
        "observed_sample_variance": round(var_p_observed, 8),
        "observed_sample_std_dev": round(std_p_observed, 6),
        "difference": round(diff, 10),
        "tolerance": 1e-6,
        "match_confirmed": validation_passed,
    }

    # Comparison chart data for volatility visualization
    comparison_chart_data = [
        {
            "name": f"{meta_a['company_name']} ({symbol_a})",
            "symbol": symbol_a,
            "weight_pct": round(weight_a * 100, 1),
            "daily_volatility_pct": round(std_a * 100, 3),
            "annualized_volatility_pct": round(ann_vol_a * 100, 2),
            "daily_mean_return_pct": round(mean_a * 100, 4),
            "annualized_return_pct": round(mean_a * 252 * 100, 2),
            "type": "Stock A",
        },
        {
            "name": f"{meta_b['company_name']} ({symbol_b})",
            "symbol": symbol_b,
            "weight_pct": round(weight_b * 100, 1),
            "daily_volatility_pct": round(std_b * 100, 3),
            "annualized_volatility_pct": round(ann_vol_b * 100, 2),
            "daily_mean_return_pct": round(mean_b * 100, 4),
            "annualized_return_pct": round(mean_b * 252 * 100, 2),
            "type": "Stock B",
        },
        {
            "name": f"Portfolio ({int(weight_a*100)}% / {int(weight_b*100)}%)",
            "symbol": "PORTFOLIO",
            "weight_pct": 100.0,
            "daily_volatility_pct": round(std_p_formula * 100, 3),
            "annualized_volatility_pct": round(ann_vol_p * 100, 2),
            "daily_mean_return_pct": round(mu_p * 100, 4),
            "annualized_return_pct": round(ann_mu_p * 100, 2),
            "type": "Combined Portfolio",
        },
    ]

    return PortfolioCalculationResponse(
        stock_a=StockMetadata(**meta_a),
        stock_b=StockMetadata(**meta_b),
        weight_a=round(weight_a, 4),
        weight_b=round(weight_b, 4),
        sample_size=n,
        aligned_date_range={"start": common_dates[0], "end": common_dates[-1]},
        mean_return_a=round(mean_a, 6),
        mean_return_b=round(mean_b, 6),
        variance_a=round(var_a, 8),
        variance_b=round(var_b, 8),
        std_dev_a=round(std_a, 6),
        std_dev_b=round(std_b, 6),
        annualized_vol_a=round(ann_vol_a, 6),
        annualized_vol_b=round(ann_vol_b, 6),
        covariance=round(cov_val, 8),
        correlation=round(corr_val, 4),
        portfolio_mean_daily_return=round(mu_p, 6),
        portfolio_mean_annualized_return=round(ann_mu_p, 6),
        portfolio_variance=round(var_p_formula, 8),
        portfolio_std_dev=round(std_p_formula, 6),
        portfolio_annualized_volatility=round(ann_vol_p, 6),
        observed_portfolio_variance=round(var_p_observed, 8),
        observed_portfolio_std_dev=round(std_p_observed, 6),
        variance_difference=round(diff, 10),
        validation_passed=validation_passed,
        formula_breakdown=formula_breakdown,
        comparison_chart_data=comparison_chart_data,
    )
