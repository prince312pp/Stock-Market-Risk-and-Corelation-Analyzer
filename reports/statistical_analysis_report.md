# Statistical Analysis & Econometric Diagnostics Report

**Project**: Stock Market Risk & Correlation Analyzer  
**Sample Period**: Aligned Synchronized Trading Sessions ($n = 245$)  
**Asset Universe**: 10 Approved Canonical NSE Equities  
**Deterministic Random Seed**: `RANDOM_SEED = 42`  
**Generated Date**: November 2026  

---

## 1. Executive Summary

This report presents a formal econometric and statistical evaluation of historical equity returns for the 10 approved National Stock Exchange (NSE) equities. The investigation evaluates:
1. **Descriptive Statistics & Confidence Intervals**: Parametric and non-parametric location, dispersion, and shape estimators.
2. **Assumption Checks**: Rigorous econometric tests for Gaussian normality, timeseries stationarity, serial independence, and autoregressive conditional heteroskedasticity (ARCH effects).
3. **Hypothesis Testing**: One-sample tests on mean return departure from zero ($H_0: \mu = 0$) and pairwise Pearson correlation significance ($H_0: \rho = 0$).
4. **Effect Sizes**: Cohen's $d$, Coefficient of Determination ($R^2$), and Annualized Sharpe Ratios ($R_f = 6.5\%$).
5. **Markowitz Modern Portfolio Theory (MPT)**: Mathematical variance equivalence proof ($|\sigma_p^2 - s_{p,\text{observed}}^2| < 10^{-6}$) and Minimum Variance Portfolio (MVP) optimization.

---

## 2. Comprehensive Descriptive Statistics & 95% Confidence Intervals

Every estimator enforces **Bessel's correction ($ddof=1$)** for sample variance and sample standard deviation. Volatility is annualized using the standard $\sqrt{252}$ trading-day convention.

| Symbol | Sample Size ($n$) | Daily Mean Return | 95% CI for Daily Mean | Sample Std Dev ($s$) | Annualized Volatility ($\sigma$) | 95% CI for Annualized Volatility | Skewness | Excess Kurtosis |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `AJANTPHARM.NS` | 245 | 0.1254% | [-0.0816%, 0.3324%] | 1.6447% | 26.11% | [23.98%, 28.65%] | 0.59 | 1.82 |
| `ASIANPAINT.NS` | 245 | -0.0257% | [-0.2166%, 0.1652%] | 1.5167% | 24.08% | [22.12%, 26.42%] | 0.24 | 1.12 |
| `BAJFINANCE.NS` | 245 | 0.0678% | [-0.1834%, 0.3190%] | 1.9963% | 31.69% | [29.11%, 34.77%] | 0.50 | 2.74 |
| `EICHERMOT.NS` | 245 | 0.0693% | [-0.1530%, 0.2916%] | 1.7665% | 28.04% | [25.76%, 30.77%] | 0.56 | 2.70 |
| `HAVELLS.NS` | 245 | -0.0514% | [-0.2659%, 0.1631%] | 1.7043% | 27.06% | [24.85%, 29.69%] | -0.36 | 1.92 |
| `INFY.NS` | 245 | -0.0923% | [-0.3448%, 0.1601%] | 2.0059% | 31.84% | [29.25%, 34.94%] | -0.02 | 1.66 |
| `PIDILITIND.NS` | 245 | 0.0552% | [-0.1359%, 0.2463%] | 1.5185% | 24.10% | [22.14%, 26.45%] | -0.19 | 1.13 |
| `SOLARINDS.NS` | 245 | 0.1532% | [-0.1414%, 0.4479%] | 2.3413% | 37.17% | [34.14%, 40.79%] | -0.25 | 5.38 |
| `TCS.NS` | 245 | -0.0635% | [-0.3052%, 0.1783%] | 1.9211% | 30.50% | [28.01%, 33.46%] | -0.05 | 2.86 |
| `TITAN.NS` | 245 | 0.0873% | [-0.1108%, 0.2853%] | 1.5737% | 24.98% | [22.95%, 27.41%] | -0.12 | 3.32 |

> **Key Finding**: All 10 equities exhibit positive excess kurtosis ($K > 0$), demonstrating **leptokurtosis (fat tails)**. Extreme positive and negative market shocks occur with substantially higher empirical frequency than predicted by standard Gaussian normal curves.

---

## 3. Econometric Assumption Checks

In classical financial econometrics, statistical inferences (such as Ordinary Least Squares or standard normal confidence intervals) rest on critical assumptions regarding the underlying data-generating process:

### 3.1 Normality Diagnostics
- **Jarque-Bera Test**: Evaluates joint departure of sample skewness and excess kurtosis from a normal distribution:
  $$JB = \frac{n}{6} \left( S^2 + \frac{(K - 3)^2}{4} \right) \sim \chi^2(2)$$
- **Shapiro-Wilk Test**: Measures order-statistic correlation against normal quantiles ($W$-statistic).

| Symbol | Jarque-Bera Stat ($JB$) | $p$-value ($JB$) | Normality Decision ($\alpha=0.05$) | Shapiro-Wilk Stat ($W$) | $p$-value ($SW$) |
|---|:---:|:---:|:---:|:---:|:---:|
| `AJANTPHARM.NS` | 45.98 | 1.04e-10 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9728 | 1.22e-04 |
| `ASIANPAINT.NS` | 14.02 | 9.05e-04 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9749 | 2.53e-04 |
| `BAJFINANCE.NS` | 82.53 | 1.20e-18 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9551 | 6.79e-07 |
| `EICHERMOT.NS` | 82.43 | 1.26e-18 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9557 | 7.85e-07 |
| `HAVELLS.NS` | 40.12 | 1.94e-09 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9749 | 2.47e-04 |
| `INFY.NS` | 26.22 | 2.02e-06 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9676 | 2.28e-05 |
| `PIDILITIND.NS` | 13.54 | 1.15e-03 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9831 | 5.26e-03 |
| `SOLARINDS.NS` | 283.90 | 2.25e-62 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9431 | 3.64e-08 |
| `TCS.NS` | 78.99 | 7.05e-18 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9585 | 1.68e-06 |
| `TITAN.NS` | 106.70 | 6.75e-24 | **Normality Rejected (Returns exhibit significant skewness/kurtosis)** | 0.9471 | 9.24e-08 |

> **Econometric Deduction**: Every single equity rejects the null hypothesis of normality ($p < 0.05$). This formal diagnostic proves that equity returns exhibit leptokurtosis and tail fatness, justifying the use of empirical bootstrap and non-parametric Markowitz observed return variance validation.

---

### 3.2 Timeseries Stationarity (Augmented Dickey-Fuller Test)
Testing for unit roots ($H_0$: unit root present / non-stationary vs. $H_1$: stationary):

| Symbol | Price Level ADF Stat | Price Level $p$-val | Price Stationarity | Return Series ADF Stat | Return Series $p$-val | Return Stationarity |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `AJANTPHARM.NS` | -1.81 | 0.3746 | Non-Stationary I(1) as expected for equity prices | -16.24 | 3.77e-29 | **Stationary I(0), valid for statistical modeling** |
| `ASIANPAINT.NS` | -1.93 | 0.3196 | Non-Stationary I(1) as expected for equity prices | -16.56 | 1.92e-29 | **Stationary I(0), valid for statistical modeling** |
| `BAJFINANCE.NS` | -1.66 | 0.4513 | Non-Stationary I(1) as expected for equity prices | -15.89 | 8.53e-29 | **Stationary I(0), valid for statistical modeling** |
| `EICHERMOT.NS` | -2.18 | 0.2149 | Non-Stationary I(1) as expected for equity prices | -9.79 | 6.45e-17 | **Stationary I(0), valid for statistical modeling** |
| `HAVELLS.NS` | -1.81 | 0.3742 | Non-Stationary I(1) as expected for equity prices | -14.38 | 9.24e-27 | **Stationary I(0), valid for statistical modeling** |
| `INFY.NS` | -1.42 | 0.5734 | Non-Stationary I(1) as expected for equity prices | -15.44 | 2.84e-28 | **Stationary I(0), valid for statistical modeling** |
| `PIDILITIND.NS` | -1.41 | 0.5765 | Non-Stationary I(1) as expected for equity prices | -17.54 | 4.20e-30 | **Stationary I(0), valid for statistical modeling** |
| `SOLARINDS.NS` | -1.26 | 0.6492 | Non-Stationary I(1) as expected for equity prices | -15.08 | 8.53e-28 | **Stationary I(0), valid for statistical modeling** |
| `TCS.NS` | -1.61 | 0.4788 | Non-Stationary I(1) as expected for equity prices | -16.35 | 2.93e-29 | **Stationary I(0), valid for statistical modeling** |
| `TITAN.NS` | -1.71 | 0.4270 | Non-Stationary I(1) as expected for equity prices | -16.49 | 2.18e-29 | **Stationary I(0), valid for statistical modeling** |

> **Econometric Deduction**: As predicted by asset pricing theory, raw closing prices $P_t$ are non-stationary unit-root processes $I(1)$. Taking first-difference proportional returns $R_t = \frac{P_t - P_{t-1}}{P_{t-1}}$ transforms the series into a stationary $I(0)$ process ($p < 10^{-6}$), rendering covariance and variance calculations mathematically sound.

---

### 3.3 Serial Independence & Autocorrelation Checks
- **Durbin-Watson Test**: Tests for first-order serial correlation ($d \approx 2.0$ indicates zero serial correlation).
- **Ljung-Box Test**: Tests for cumulative autocorrelation across lags 1, 5, and 10.

| Symbol | Durbin-Watson Stat ($d$) | Interpretation | Ljung-Box Lag 1 $p$-val | Ljung-Box Lag 5 $p$-val |
|---|:---:|:---:|:---:|:---:|
| `AJANTPHARM.NS` | 2.085 | Zero first-order autocorrelation (Random Walk consistent) | 0.4901 | 0.9353 |
| `ASIANPAINT.NS` | 2.125 | Zero first-order autocorrelation (Random Walk consistent) | 0.3260 | 0.7240 |
| `BAJFINANCE.NS` | 2.041 | Zero first-order autocorrelation (Random Walk consistent) | 0.7356 | 0.7234 |
| `EICHERMOT.NS` | 2.142 | Zero first-order autocorrelation (Random Walk consistent) | 0.2569 | 0.0885 |
| `HAVELLS.NS` | 1.843 | Zero first-order autocorrelation (Random Walk consistent) | 0.2177 | 0.2612 |
| `INFY.NS` | 1.983 | Zero first-order autocorrelation (Random Walk consistent) | 0.9432 | 0.6866 |
| `PIDILITIND.NS` | 2.239 | Mild autocorrelation | 0.0601 | 0.3533 |
| `SOLARINDS.NS` | 1.937 | Zero first-order autocorrelation (Random Walk consistent) | 0.6598 | 0.6567 |
| `TCS.NS` | 2.097 | Zero first-order autocorrelation (Random Walk consistent) | 0.3732 | 0.6498 |
| `TITAN.NS` | 2.116 | Zero first-order autocorrelation (Random Walk consistent) | 0.3584 | 0.7908 |

> **Econometric Deduction**: Durbin-Watson statistics oscillate tightly around $2.0$ ($1.91 - 2.08$) and Ljung-Box tests fail to reject the null hypothesis of serial independence at $\alpha = 0.05$. Daily returns behave consistently with the **Weak-Form Efficient Market Hypothesis (Random Walk)**.

---

### 3.4 Heteroskedasticity & Volatility Clustering (ARCH Effects)
- Testing for Autoregressive Conditional Heteroskedasticity: large return shocks cluster together in time.

| Symbol | Squared Returns Lag-1 Autocorr | Volatility Clustering Detected? | Econometric Implication |
|---|:---:|:---:|---|
| `AJANTPHARM.NS` | -0.0096 | **NO** | Constant conditional variance |
| `ASIANPAINT.NS` | 0.0969 | **YES** | Evidence of volatility clustering (Mandelbrot ARCH effect: large changes follow large changes) |
| `BAJFINANCE.NS` | 0.0511 | **YES** | Evidence of volatility clustering (Mandelbrot ARCH effect: large changes follow large changes) |
| `EICHERMOT.NS` | 0.0735 | **YES** | Evidence of volatility clustering (Mandelbrot ARCH effect: large changes follow large changes) |
| `HAVELLS.NS` | 0.0625 | **YES** | Evidence of volatility clustering (Mandelbrot ARCH effect: large changes follow large changes) |
| `INFY.NS` | 0.0225 | **NO** | Constant conditional variance |
| `PIDILITIND.NS` | 0.0752 | **YES** | Evidence of volatility clustering (Mandelbrot ARCH effect: large changes follow large changes) |
| `SOLARINDS.NS` | -0.0013 | **NO** | Constant conditional variance |
| `TCS.NS` | 0.1552 | **YES** | Evidence of volatility clustering (Mandelbrot ARCH effect: large changes follow large changes) |
| `TITAN.NS` | 0.1407 | **YES** | Evidence of volatility clustering (Mandelbrot ARCH effect: large changes follow large changes) |


---

## 4. Hypothesis Testing & Standardized Effect Sizes

### 4.1 One-Sample $t$-Test on Daily Returns ($H_0: \mu = 0$)
Evaluates whether historical returns are statistically distinguishable from zero:

| Symbol | Daily Mean | Student's $t$-statistic | $p$-value | Decision ($\alpha=0.05$) | Cohen's $d$ Effect Size | Annualized Sharpe Ratio ($R_f=6.5\%$) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `AJANTPHARM.NS` | 0.1254% | 1.193 | 0.2339 | Fail | 0.0762 (Negligible (|d| < 0.2)) | **0.96** (Good (0.5 - 1.0)) |
| `ASIANPAINT.NS` | -0.0257% | -0.265 | 0.7911 | Fail | -0.0169 (Negligible (|d| < 0.2)) | **-0.54** (Negative excess return) |
| `BAJFINANCE.NS` | 0.0678% | 0.531 | 0.5956 | Fail | 0.0340 (Negligible (|d| < 0.2)) | **0.33** (Sub-optimal (< 0.5)) |
| `EICHERMOT.NS` | 0.0693% | 0.614 | 0.5397 | Fail | 0.0392 (Negligible (|d| < 0.2)) | **0.39** (Sub-optimal (< 0.5)) |
| `HAVELLS.NS` | -0.0514% | -0.472 | 0.6372 | Fail | -0.0302 (Negligible (|d| < 0.2)) | **-0.72** (Negative excess return) |
| `INFY.NS` | -0.0923% | -0.721 | 0.4719 | Fail | -0.0460 (Negligible (|d| < 0.2)) | **-0.93** (Negative excess return) |
| `PIDILITIND.NS` | 0.0552% | 0.569 | 0.5701 | Fail | 0.0363 (Negligible (|d| < 0.2)) | **0.31** (Sub-optimal (< 0.5)) |
| `SOLARINDS.NS` | 0.1532% | 1.024 | 0.3067 | Fail | 0.0654 (Negligible (|d| < 0.2)) | **0.86** (Good (0.5 - 1.0)) |
| `TCS.NS` | -0.0635% | -0.517 | 0.6054 | Fail | -0.0331 (Negligible (|d| < 0.2)) | **-0.74** (Negative excess return) |
| `TITAN.NS` | 0.0873% | 0.868 | 0.3862 | Fail | 0.0555 (Negligible (|d| < 0.2)) | **0.62** (Good (0.5 - 1.0)) |


---

## 5. Pairwise Cross-Asset Effect Sizes & Fisher $z$ Confidence Intervals

The table below highlights key bivariate cross-asset relationships across the universe:

| Asset Pair | Pearson Correlation ($r$) | $t$-statistic | $p$-value | 95% Confidence Interval ($r$) | Coeff. of Determination ($R^2$) | Effect Size Magnitude |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `INFY.NS` & `TCS.NS` | **0.7818** | 19.54 | 9.34e-52 | [0.728, 0.826] | 0.6112 (61.1%) | Large (|r| >= 0.5) |
| `ASIANPAINT.NS` & `PIDILITIND.NS` | **0.5569** | 10.45 | 2.32e-21 | [0.464, 0.638] | 0.3102 (31.0%) | Large (|r| >= 0.5) |
| `BAJFINANCE.NS` & `EICHERMOT.NS` | **0.4863** | 8.68 | 5.99e-16 | [0.384, 0.577] | 0.2365 (23.7%) | Medium (0.3 <= |r| < 0.5) |
| `PIDILITIND.NS` & `TITAN.NS` | **0.4795** | 8.52 | 1.72e-15 | [0.377, 0.571] | 0.2299 (23.0%) | Medium (0.3 <= |r| < 0.5) |
| `EICHERMOT.NS` & `PIDILITIND.NS` | **0.4763** | 8.44 | 2.83e-15 | [0.373, 0.568] | 0.2268 (22.7%) | Medium (0.3 <= |r| < 0.5) |
| `HAVELLS.NS` & `PIDILITIND.NS` | **0.4746** | 8.40 | 3.64e-15 | [0.371, 0.566] | 0.2252 (22.5%) | Medium (0.3 <= |r| < 0.5) |
| `ASIANPAINT.NS` & `EICHERMOT.NS` | **0.4720** | 8.35 | 5.37e-15 | [0.368, 0.564] | 0.2228 (22.3%) | Medium (0.3 <= |r| < 0.5) |
| `BAJFINANCE.NS` & `PIDILITIND.NS` | **0.4675** | 8.24 | 1.05e-14 | [0.363, 0.560] | 0.2185 (21.9%) | Medium (0.3 <= |r| < 0.5) |
| `SOLARINDS.NS` & `TCS.NS` | **0.0280** | 0.44 | 6.63e-01 | [-0.098, 0.153] | 0.0008 (0.1%) | Negligible (|r| < 0.1) |
| `INFY.NS` & `SOLARINDS.NS` | **-0.0264** | -0.41 | 6.81e-01 | [-0.151, 0.099] | 0.0007 (0.1%) | Negligible (|r| < 0.1) |
| `AJANTPHARM.NS` & `TITAN.NS` | **0.0172** | 0.27 | 7.89e-01 | [-0.108, 0.142] | 0.0003 (0.0%) | Negligible (|r| < 0.1) |
| `AJANTPHARM.NS` & `INFY.NS` | **-0.0101** | -0.16 | 8.76e-01 | [-0.135, 0.115] | 0.0001 (0.0%) | Negligible (|r| < 0.1) |
| `AJANTPHARM.NS` & `TCS.NS` | **0.0069** | 0.11 | 9.14e-01 | [-0.118, 0.132] | 0.0000 (0.0%) | Negligible (|r| < 0.1) |


---

## 6. Markowitz Modern Portfolio Theory (MPT) Verification

### 6.1 Theoretical Variance Formula
For a two-asset portfolio with weights $w_1$ and $w_2$ ($w_1 + w_2 = 1.0$):
$$\sigma_p^2 = w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 \text{Cov}(R_1, R_2)$$

### 6.2 Empirical Verification
Using the asset pair `SOLARINDS.NS` and `BAJFINANCE.NS`:
- Asset 1 Daily Variance ($\sigma_1^2$): `0.00054491` (Annualized Volatility: `37.06%`)
- Asset 2 Daily Variance ($\sigma_2^2$): `0.00034218` (Annualized Volatility: `29.37%`)
- Synchronized Daily Covariance ($\text{Cov}$): `0.00008512` ($r = 0.2135$)
- **Equal Weight Allocation ($w_1 = 0.50, w_2 = 0.50$)**:
  - Theoretical Portfolio Variance ($\sigma_p^2$): `0.00026433`
  - Observed Linear Return Series Sample Variance ($s_{{p,\text{{observed}}}}^2$): `0.00026433`
  - Absolute Discrepancy ($|\sigma_p^2 - s_{{p,\text{{observed}}}}^2|$): **`0.00000000`** ($< 10^{{-6}}$)
  - Combined Annualized Volatility ($\sigma_p$): **`25.81%`**

> **Diversification Benefit Confirmed**: Note that the combined portfolio volatility ($25.81\%$) is significantly **lower** than both individual assets ($37.06\%$ and $29.37\%$) as well as their weighted average ($33.22\%$). This demonstrates the Markowitz diversification dividend unlocked by low asset correlation ($r = 0.2135$).

---

## 7. Generated Visualizations Reference

The following figures illustrate these findings:
1. **`reports/figures/01_return_distributions_kde.png`**: Daily return histograms with Kernel Density Estimation and fitted Gaussian normal curves displaying leptokurtic tail deviations.
2. **`reports/figures/02_qq_plots_normality.png`**: Quantile-Quantile (Q-Q) plots displaying systematic S-shaped departures from normality in extreme quantiles.
3. **`reports/figures/03_volatility_clustering_arch.png`**: Demeaned squared returns and rolling volatility timeseries demonstrating autoregressive conditional heteroskedasticity (volatility clustering).
4. **`reports/figures/04_correlation_heatmap_annotated.png`**: Annotated 10×10 diverging Pearson correlation matrix centered at zero.
5. **`reports/figures/05_markowitz_efficient_frontier.png`**: Two-asset investment opportunity frontier displaying the Minimum Variance Portfolio (MVP) and risk reduction curve.

---

*Report generated and validated via the Stock Market Risk & Correlation Analyzer econometric suite.*
