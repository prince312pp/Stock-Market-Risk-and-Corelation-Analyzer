-- ==============================================================================
-- Stock Market Risk & Correlation Analyzer
-- Relational Database Schema Definition (sql/schema.sql)
-- Compatible with PostgreSQL, MySQL, and SQLite
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table: stocks
-- Stores metadata for the 10 approved canonical NSE equities.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stocks (
    symbol          VARCHAR(20)     PRIMARY KEY,
    company_name    VARCHAR(150)    NOT NULL,
    sector          VARCHAR(100)    NOT NULL,
    exchange        VARCHAR(20)     NOT NULL DEFAULT 'NSE',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);

-- ------------------------------------------------------------------------------
-- 2. Table: prices
-- Stores daily historical OHLCV market observations from Yahoo Finance.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prices (
    id              BIGSERIAL       PRIMARY KEY,
    symbol          VARCHAR(20)     NOT NULL,
    date            DATE            NOT NULL,
    open            DECIMAL(14, 4)  NOT NULL,
    high            DECIMAL(14, 4)  NOT NULL,
    low             DECIMAL(14, 4)  NOT NULL,
    close           DECIMAL(14, 4)  NOT NULL,
    adjusted_close  DECIMAL(14, 4)  NOT NULL,
    volume          BIGINT          NOT NULL,
    source          VARCHAR(50)     NOT NULL DEFAULT 'Yahoo Finance',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prices_stocks 
        FOREIGN KEY (symbol) 
        REFERENCES stocks(symbol) 
        ON DELETE CASCADE,

    CONSTRAINT uq_symbol_date 
        UNIQUE (symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_prices_symbol_date ON prices(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(date);

-- ------------------------------------------------------------------------------
-- 3. Seed Data: 10 Approved Canonical NSE Equities
-- ------------------------------------------------------------------------------
INSERT INTO stocks (symbol, company_name, sector, exchange) VALUES
    ('SOLARINDS.NS',  'Solar Industries India',       'Chemicals & Explosives',  'NSE'),
    ('BAJFINANCE.NS', 'Bajaj Finance',                'Financial Services',      'NSE'),
    ('TITAN.NS',      'Titan Company',                'Consumer Discretionary',  'NSE'),
    ('EICHERMOT.NS',  'Eicher Motors',                'Automobile',              'NSE'),
    ('PIDILITIND.NS', 'Pidilite Industries',          'Chemicals & Adhesives',   'NSE'),
    ('INFY.NS',       'Infosys',                      'IT',                      'NSE'),
    ('TCS.NS',        'Tata Consultancy Services',    'IT',                      'NSE'),
    ('ASIANPAINT.NS', 'Asian Paints',                 'Consumer Goods & Paints', 'NSE'),
    ('AJANTPHARM.NS', 'Ajanta Pharma',                'Pharmaceuticals',         'NSE'),
    ('HAVELLS.NS',    'Havells India',                'Consumer Electricals',    'NSE')
ON CONFLICT (symbol) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    sector       = EXCLUDED.sector,
    exchange     = EXCLUDED.exchange;

-- ------------------------------------------------------------------------------
-- 4. Analytical View: Daily Simple Returns (Window Function)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_daily_returns AS
SELECT 
    symbol,
    date,
    close,
    adjusted_close,
    LAG(adjusted_close, 1) OVER (
        PARTITION BY symbol 
        ORDER BY date ASC
    ) AS prev_adjusted_close,
    ROUND(
        (adjusted_close - LAG(adjusted_close, 1) OVER (PARTITION BY symbol ORDER BY date ASC)) / 
        LAG(adjusted_close, 1) OVER (PARTITION BY symbol ORDER BY date ASC),
        8
    ) AS daily_return,
    ROUND(
        ((adjusted_close - LAG(adjusted_close, 1) OVER (PARTITION BY symbol ORDER BY date ASC)) / 
        LAG(adjusted_close, 1) OVER (PARTITION BY symbol ORDER BY date ASC)) * 100.0,
        4
    ) AS daily_return_pct
FROM prices;
