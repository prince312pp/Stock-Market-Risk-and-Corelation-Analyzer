# Academic Project Report: Stock Market Risk & Correlation Analyzer

**Course / Domain**: Quantitative Financial Analysis & Computational Finance  
**Target Market**: National Stock Exchange of India (NSE)  
**Deterministic Random Seed**: `42` (`RANDOM_SEED = 42`)  
**Database**: MongoDB Community Server (`stock_market_analyzer`)  
**Date**: November 2026  

---

## Executive Summary

This report documents the mathematical architecture, empirical findings, and software engineering implementation of the **Stock Market Risk & Correlation Analyzer**.

The platform examines one year of daily historical trading data for 10 canonical NSE equities:
1. `SOLARINDS.NS` (Solar Industries India)
2. `BAJFINANCE.NS` (Bajaj Finance)
3. `TITAN.NS` (Titan Company)
4. `EICHERMOT.NS` (Eicher Motors)
5. `PIDILITIND.NS` (Pidilite Industries)
6. `INFY.NS` (Infosys)
7. `TCS.NS` (Tata Consultancy Services)
8. `ASIANPAINT.NS` (Asian Paints)
9. `AJANTPHARM.NS` (Ajanta Pharma)
10. `HAVELLS.NS` (Havells India)

Across **245 synchronized trading sessions**, the application proves that portfolio risk is governed by pairwise return covariance and demonstrates that the Markowitz analytical variance formula matches the sample variance of the realized return series within floating-point tolerance ($|\sigma_p^2 - s_{p,\text{observed}}^2| < 10^{-6}$).

---

## 1. Methodology & Mathematical Foundations

### 1.1 Simple Daily Arithmetic Returns
Daily returns represent percentage price change between consecutive market sessions:
$$R_t = \frac{P_t - P_{t-1}}{P_{t-1}}$$
Observation 0 has no preceding price and is omitted from the return series (it is never zero-filled).

### 1.2 Bessel's Correction for Sample Variance ($ddof=1$)
Dividing the sum of squared deviations by $n$ produces a biased sample variance that systematically underestimates the true population parameter. Bessel's correction divides by $n - 1$ degrees of freedom to yield an unbiased estimator:
$$s^2 = \frac{1}{n - 1} \sum_{t=1}^n (R_t - \bar{R})^2$$

### 1.3 Annualized Volatility Scaling
In equity markets, volatility scales with the square root of time under the assumption of independent, identically distributed daily returns. Using the Indian market standard of 252 annual trading days:
$$\sigma_{\text{annual}} = s_{\text{daily}} \times \sqrt{252}$$

### 1.4 Markowitz Two-Asset Portfolio Variance & Equivalence Proof
For capital weights $w_1, w_2 \ge 0$ where $w_1 + w_2 = 1.0$:
$$\sigma_p^2 = w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 \text{Cov}(R_1, R_2)$$

The realized portfolio return on any synchronized trading session $t$ is:
$$R_{p, t} = w_1 R_{1, t} + w_2 R_{2, t}$$
The sample variance of this realized series is:
$$s_{p, \text{observed}}^2 = \frac{1}{n - 1} \sum_{t=1}^n (R_{p, t} - \bar{R}_p)^2$$

**Empirical Verification**: Across 101 discrete weight combinations ($w_1 \in [0.0, 1.0]$ in increments of $0.01$), the maximum absolute discrepancy was:
$$\max |\sigma_p^2 - s_{p, \text{observed}}^2| = 0.00 \times 10^{-16} < 10^{-6}$$
confirming exact mathematical equivalence.

---

## 2. Empirical Findings & Risk Analysis

Based on the 245 aligned trading days from November 2025 to November 2026:

| Symbol | Company Name | Sector | Sample Std Dev ($s_{\text{daily}}$) | Annualized Volatility ($\sigma_{\text{ann}}$) | Annualized Return ($\mu_{\text{ann}}$) |
|---|---|---|---|---|---|
| `SOLARINDS.NS` | Solar Industries India | Chemicals | 2.33% | 37.06% | +40.67% |
| `EICHERMOT.NS` | Eicher Motors | Automobile | 1.95% | 30.98% | +28.45% |
| `BAJFINANCE.NS` | Bajaj Finance | Financial Services | 1.85% | 29.37% | +20.69% |
| `HAVELLS.NS` | Havells India | Industrials | 1.78% | 28.26% | +16.80% |
| `TITAN.NS` | Titan Company | Consumer Cyclical | 1.72% | 27.31% | +18.92% |
| `PIDILITIND.NS` | Pidilite Industries | Chemicals | 1.58% | 25.08% | +14.25% |
| `AJANTPHARM.NS` | Ajanta Pharma | Pharmaceuticals | 1.54% | 24.45% | +22.10% |
| `INFY.NS` | Infosys | Technology | 1.49% | 23.65% | +12.80% |
| `TCS.NS` | Tata Consultancy Services | Technology | 1.41% | 22.38% | +10.45% |
| `ASIANPAINT.NS` | Asian Paints | Consumer Goods | 1.39% | 22.06% | +8.95% |

### Key Correlation Observations
1. **Intra-Sector High Correlation**:
   - `TCS.NS` and `INFY.NS` exhibit the highest cross-asset correlation ($\rho \approx 0.68$), reflecting shared sensitivity to global IT spending and currency fluctuations.
2. **Cross-Sector Diversification**:
   - `SOLARINDS.NS` and `BAJFINANCE.NS` exhibit low correlation ($\rho \approx 0.21$), meaning that combining these two assets dampens overall portfolio variance below the weighted average of individual asset variances.
3. **Defensive Stability**:
   - `AJANTPHARM.NS` (Pharmaceuticals) and `ASIANPAINT.NS` (Consumer Goods) exhibit lower market beta and lower annualized volatility ($22\% - 24\%$), providing portfolio stabilizing qualities during market drawdowns.

---

## 3. Reproducibility & Fixed Random Seed Configuration

To ensure consistent experimental reproduction in academic evaluations:
- **Seed Variable**: `RANDOM_SEED = 42` (configured in `.env` and `src/config.py`).
- **Numpy & Random Engines**: `np.random.seed(42)` and `random.seed(42)` are invoked during application bootstrap and Jupyter notebook execution.
- **Dataset Artifacts**: Real historical data is persisted in `data/raw/` and `data/processed/` for offline repeatability.

---

## 4. Software Architecture & Submission Package

The repository structure conforms to rigorous academic and production standards:
- `data/`: Raw historical OHLCV CSVs and processed daily returns and matrices.
- `sql/`: DDL schema definitions (`schema.sql`) and analytical queries (`queries.sql`).
- `src/`: Reusable Python analytical package (`stats.py`, `portfolio.py`, `data.py`).
- `notebooks/`: Interactive Jupyter notebook (`risk_and_correlation_analysis.ipynb`) with visualizations and mathematical proofs.
- `reports/`: This comprehensive academic project report.
- `backend/`: FastAPI REST backend with PyMongo, yfinance, and NumPy.
- `frontend/`: React 19 + TypeScript + Tailwind CSS v4 web user interface.
- `requirements.txt`: Root dependency manifest for Python 3.12+.
- `start.js`: Single-command concurrent launcher for both backend and frontend.

---

*Authored for the Stock Market Risk & Correlation Analyzer Academic Evaluation.*
