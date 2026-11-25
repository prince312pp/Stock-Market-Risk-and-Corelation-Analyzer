-- ==============================================================================
-- Stock Market Risk & Correlation Analyzer
-- Analytical SQL Queries (sql/queries.sql)
-- ==============================================================================

-- 1. Descriptive Summary per Stock (Total Observations, Min Date, Max Date)
SELECT 
    p.symbol,
    s.company_name,
    s.sector,
    COUNT(p.id) AS total_trading_sessions,
    MIN(p.date) AS start_date,
    MAX(p.date) AS end_date,
    ROUND(MIN(p.close), 2) AS min_closing_price,
    ROUND(MAX(p.close), 2) AS max_closing_price,
    ROUND(AVG(p.close), 2) AS avg_closing_price
FROM prices p
JOIN stocks s ON p.symbol = s.symbol
GROUP BY p.symbol, s.company_name, s.sector
ORDER BY p.symbol;

-- 2. Daily Returns Analysis with Bessel's Correction Sample Statistics
-- Demonstrating Sample Mean Return, Sample Variance (N - 1), and Sample Std Dev
WITH return_stats AS (
    SELECT 
        symbol,
        COUNT(daily_return) AS sample_size,
        AVG(daily_return) AS mean_daily_return,
        -- Sample Variance: sum((R_t - mean)^2) / (N - 1)
        VAR_SAMP(daily_return) AS sample_variance,
        -- Sample Standard Deviation (Bessel's correction ddof=1)
        STDDEV_SAMP(daily_return) AS sample_std_dev
    FROM v_daily_returns
    WHERE daily_return IS NOT NULL
    GROUP BY symbol
)
SELECT 
    symbol,
    sample_size,
    ROUND(mean_daily_return * 100.0, 4) AS mean_daily_return_pct,
    ROUND(sample_variance, 8) AS sample_variance_ddof1,
    ROUND(sample_std_dev * 100.0, 4) AS daily_volatility_pct,
    -- Annualized Volatility: s * sqrt(252)
    ROUND(sample_std_dev * SQRT(252) * 100.0, 2) AS annualized_volatility_pct,
    -- Annualized Arithmetic Mean Return: mean * 252
    ROUND(mean_daily_return * 252 * 100.0, 2) AS annualized_mean_return_pct
FROM return_stats
ORDER BY annualized_volatility_pct DESC;

-- 3. Synchronized Pairwise Date Alignment (e.g., SOLARINDS.NS vs BAJFINANCE.NS)
SELECT 
    r1.date,
    r1.symbol AS asset_1,
    r1.daily_return AS return_asset_1,
    r2.symbol AS asset_2,
    r2.daily_return AS return_asset_2
FROM v_daily_returns r1
JOIN v_daily_returns r2 
    ON r1.date = r2.date
WHERE r1.symbol = 'SOLARINDS.NS' 
  AND r2.symbol = 'BAJFINANCE.NS'
  AND r1.daily_return IS NOT NULL 
  AND r2.daily_return IS NOT NULL
ORDER BY r1.date ASC;
