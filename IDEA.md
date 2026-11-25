# Stock Market Risk & Correlation Analyzer

> **Project purpose:** A focused academic application that fetches real historical stock-market data, demonstrates statistical calculations step by step, and presents the results through clear graphs.

This document is the single source of truth for the project. Read it completely before making implementation changes. The application is intended for a classroom demonstration and presentation. Keep the implementation small, understandable, and reliable.

---

## 1. Project Overview

### Project name
**Stock Market Risk & Correlation Analyzer**

### Short description
A web application that retrieves historical prices for a fixed set of NSE-listed stocks, calculates basic return and risk statistics, explores how stocks move in relation to one another, and visualizes the results.

### Core presentation goal
The application should make it easy to demonstrate:

1. Where historical stock data comes from.
2. How daily returns are calculated from closing prices.
3. How mean return, variance, and standard deviation are calculated.
4. What covariance and correlation tell us about two stocks.
5. How combining two stocks affects portfolio risk.
6. How the calculations are represented in tables and graphs.

**The mathematics and its explanation are the main feature.** Do not turn this into a large financial platform.

### Intended users
- Student presenting the project.
- Faculty evaluating the calculations and implementation.
- Anyone viewing the charts and wanting to understand the basic statistical concepts.

### Scope statement
Build a small, functional academic application. Do not describe or label the application as a “prototype.” It is the project application for demonstrating the stated concepts.

---

## 2. Fixed Stock Universe

Use exactly these ten stocks and Yahoo Finance NSE ticker symbols:

| # | Company | Yahoo Finance ticker | Sector |
|---:|---|---|---|
| 1 | Solar Industries India | `SOLARINDS.NS` | Chemicals & Explosives |
| 2 | Bajaj Finance | `BAJFINANCE.NS` | Financial Services |
| 3 | Titan Company | `TITAN.NS` | Consumer Discretionary |
| 4 | Eicher Motors | `EICHERMOT.NS` | Automobile |
| 5 | Pidilite Industries | `PIDILITIND.NS` | Chemicals & Adhesives |
| 6 | Infosys | `INFY.NS` | IT |
| 7 | Tata Consultancy Services | `TCS.NS` | IT |
| 8 | Asian Paints | `ASIANPAINT.NS` | Consumer Goods & Paints |
| 9 | Ajanta Pharma | `AJANTPHARM.NS` | Pharmaceuticals |
| 10 | Havells India | `HAVELLS.NS` | Consumer Electricals |

### Stock-universe rules
- Do not add other tickers.
- Do not silently replace a ticker if Yahoo Finance returns an error, a ticker is renamed, or data is unavailable.
- If a ticker cannot be resolved, stop that stock's ingestion and report the issue clearly. Ask the project owner to verify the mapping before changing it.
- The interface should let the presenter select from this fixed list.

---

## 3. Functional Requirements

### 3.1 Fetch historical stock data

Use `yfinance` to fetch daily historical data for the fixed stock list.

Requirements:
- Provide a simple date-range selector.
- Use daily interval data.
- Retrieve available OHLCV fields: Open, High, Low, Close, Adjusted Close (when supplied), and Volume.
- Show the selected stock, ticker, date range, and most recent available market-data date.
- Handle weekends, exchange holidays, missing observations, network errors, and invalid date ranges gracefully.
- Show a visible loading state while fetching.
- Show a useful error or empty state if data cannot be fetched.
- Do not claim data is real-time. Yahoo Finance historical data may be delayed or unavailable for the current trading day.
- Do not generate fake prices or fabricated historical observations.

Use adjusted closing prices for return calculations when available. If adjusted close is unavailable, use close and clearly display which price field was used.

### 3.2 Display fetched data

Provide a compact historical-data table with:
- Date
- Open
- High
- Low
- Close
- Adjusted Close, if available
- Volume

The table should support:
- Sorting by date.
- A reasonable default number of visible rows.
- Simple pagination or a limited display with a clear way to inspect more rows.
- Numeric formatting that is readable and consistent.

### 3.3 Calculate daily returns

Use simple daily returns as the primary measure:

\[
R_t = \frac{P_t-P_{t-1}}{P_{t-1}}
\]

Where:
- \(P_t\) is the selected adjusted closing price on day \(t\).
- \(P_{t-1}\) is the previous available trading day's adjusted closing price.

Display:
- Date
- Previous adjusted close
- Current adjusted close
- Daily return as a percentage

The first observation has no previous price and therefore no daily return. Do not fill it with zero.

### 3.4 Calculate descriptive statistics

For each selected stock, calculate and display:

**Mean daily return**

\[
\bar R = \frac{1}{n}\sum_{t=1}^{n}R_t
\]

**Sample variance**

\[
s^2 = \frac{1}{n-1}\sum_{t=1}^{n}(R_t-\bar R)^2
\]

**Sample standard deviation**

\[
s = \sqrt{s^2}
\]

Use sample variance and standard deviation (`ddof=1`).

Also show annualized volatility for context:

\[
\sigma_{\text{annual}} = s_{\text{daily}}\sqrt{252}
\]

If annualized mean return is displayed, label it as an arithmetic annualization:

\[
\mu_{\text{annual}} = \bar R_{\text{daily}}\times252
\]

Do not present these historical statistics as guaranteed future performance.

### 3.5 Covariance and correlation

For selected stocks, calculate:
- Covariance matrix of daily returns.
- Pearson correlation matrix of daily returns.

**Sample covariance**

\[
Cov(X,Y)=\frac{\sum_{i=1}^{n}(X_i-\bar X)(Y_i-\bar Y)}{n-1}
\]

**Pearson correlation**

\[
\rho_{X,Y}=\frac{Cov(X,Y)}{s_Xs_Y}
\]

Explain the correlation scale:
- Near `+1`: the two return series tend to move in the same direction.
- Near `0`: little linear relationship is observed.
- Near `-1`: the two return series tend to move in opposite directions.

Use dates common to both stocks when comparing their returns. Do not align unrelated observations by row position if their dates differ.

### 3.6 Two-stock portfolio calculator

This is the only portfolio feature required.

Allow the user to:
1. Select two stocks from the fixed stock list.
2. Enter the allocation percentage for Stock A.
3. Enter the allocation percentage for Stock B, or calculate it as the remainder.
4. Validate that both weights are between 0 and 1 and sum to 1 (100%).
5. View the calculated portfolio return and risk.

Portfolio daily return:

\[
R_p=w_1R_1+w_2R_2
\]

Expected portfolio daily return using historical arithmetic means:

\[
\mu_p=w_1\mu_1+w_2\mu_2
\]

Portfolio variance:

\[
\sigma_p^2=w_1^2\sigma_1^2+w_2^2\sigma_2^2+2w_1w_2Cov(R_1,R_2)
\]

Portfolio standard deviation:

\[
\sigma_p=\sqrt{\sigma_p^2}
\]

Display:
- Selected stocks.
- Allocation weights.
- Individual mean daily returns.
- Individual standard deviations.
- Covariance and correlation.
- Portfolio mean daily return.
- Portfolio variance.
- Portfolio standard deviation.
- Annualized portfolio volatility, if useful.

Show the formula and the actual input values used in the calculation so the presenter can explain the result.

Use aligned daily return observations for both stocks. Calculate the observed portfolio return series using the same weights and dates.

**Validation requirement:** The variance from the theoretical formula should match the sample variance of the calculated portfolio return series within a small numerical tolerance, provided the same aligned observations, weights, and sample covariance convention are used.

Do not add short selling, leverage, automated trading, or a complex optimization engine.

---

## 4. Graphs and Visualizations

The graphs should be generated from fetched market data and calculated returns, not decorative sample values.

### Required charts

1. **Historical closing-price line chart**
   - X-axis: trading date.
   - Y-axis: selected price field.
   - Allow the presenter to select a stock.

2. **Daily-return chart**
   - Plot daily returns over time.
   - Clearly label the y-axis as daily return (%).

3. **Stock volatility comparison**
   - Bar chart comparing daily or annualized volatility for selected stocks.
   - State which volatility measure is displayed.

4. **Correlation heatmap**
   - Show the Pearson correlation matrix for the ten stocks or a selected subset.
   - Use a diverging scale centered at zero.
   - Show the numerical correlation value on hover or in the cell where practical.
   - Use consistent stock labels.

5. **Two-stock portfolio comparison**
   - Compare the individual stocks' historical volatility with the combined portfolio's volatility.
   - Clearly identify the selected allocation weights.
   - Do not imply that diversification always reduces risk.

### Chart quality
- Every chart needs a title, axis labels, units, and a short explanation.
- Tooltips should show readable dates and numeric values.
- Avoid clutter, unnecessary animation, 3D charts, and decorative chart effects.
- Provide an empty state when insufficient data is available.

---

## 5. Application Pages

Keep the application to four main pages.

### Page 1 — Dashboard

Purpose: give the presenter a quick overview.

Include:
- Project title and short description.
- Data source label: Yahoo Finance via `yfinance`.
- Latest available data date.
- Number of stocks in the fixed universe.
- A small selection of key statistics for a selected stock.
- A historical price chart.
- A clear route to the analysis pages.

Do not add elaborate market-news feeds, user accounts, or unrelated dashboard widgets.

### Page 2 — Stock Analysis

Purpose: demonstrate fetched data and calculations for one stock.

Include:
- Stock selector.
- Date-range selector.
- Historical OHLCV table.
- Historical closing-price chart.
- Daily-return table or preview.
- Mean daily return, variance, standard deviation, and annualized volatility.
- A calculation explanation showing the formula and the values used.

### Page 3 — Correlation Analysis

Purpose: explain how stocks move in relation to one another.

Include:
- Correlation heatmap.
- Correlation matrix values.
- Covariance matrix values, accessible in a simple table.
- A two-stock selector for a focused comparison.
- Short plain-language interpretation of the selected pair's correlation.

### Page 4 — Portfolio Calculator

Purpose: demonstrate how two assets combine into a portfolio.

Include:
- Two stock selectors.
- Two allocation inputs that total 100%.
- Portfolio calculation results.
- Formula and substituted values.
- Individual-versus-portfolio risk comparison chart.
- A short explanation of how covariance affects portfolio risk.

---

## 6. Technology Stack

Use this stack unless the project owner explicitly approves a change.

### Backend
- Python 3.11+
- FastAPI
- Uvicorn
- yfinance
- Pandas
- NumPy
- PyMongo
- Pydantic
- python-dotenv
- Python standard logging

### Database
- MongoDB only.
- Local MongoDB Community Server is preferred for a straightforward local academic setup.
- MongoDB Atlas may be used only after the project owner approves the external service and provides credentials.
- Do not introduce SQL databases.

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- React Router
- TanStack Query (use only where it simplifies API data fetching)

Keep dependencies limited. Do not add libraries without a clear need.

### Testing and quality
- pytest
- FastAPI TestClient or HTTPX
- Vitest for essential frontend logic
- Ruff for Python linting/formatting
- ESLint and Prettier for frontend code

Do not build an elaborate testing or deployment platform. Prioritize tests for calculations, data alignment, API behavior, and important user flows.

---

## 7. MongoDB Data Design

Database name: `stock_market_analyzer`

Use only the following essential collections.

### 7.1 `stocks`

Stores metadata for the fixed ten-stock universe.

Example document:

```json
{
  "symbol": "SOLARINDS.NS",
  "company_name": "Solar Industries India",
  "sector": "Chemicals & Explosives",
  "exchange": "NSE"
}
```

### 7.2 `prices`

Stores fetched daily market observations.

Example document:

```json
{
  "symbol": "SOLARINDS.NS",
  "date": "BSON Date",
  "open": 0.0,
  "high": 0.0,
  "low": 0.0,
  "close": 0.0,
  "adjusted_close": 0.0,
  "volume": 0,
  "source": "Yahoo Finance"
}
```

Use actual numeric values from the data provider; the zeroes above are schema placeholders only, not market data.

Create a unique compound index on `(symbol, date)` to prevent duplicate daily records.

### Database behavior
- Store dates as BSON Date values, not formatted date strings.
- Upsert fetched observations so repeating a data fetch does not create duplicates.
- Store only actual provider data.
- Do not seed fabricated prices.
- The `stocks` collection may be initialized with the ten approved metadata records.
- The application should continue to work if the database has no historical price records yet; show an appropriate data-fetch action or empty state.

### Academic DBMS explanation
The `prices` collection represents the price table concept. Daily returns are derived from ordered price records using Pandas or a MongoDB aggregation pipeline. A materialized `returns` collection is not required for this small application. Explain this distinction during the presentation if asked about the original table/view concept.

---

## 8. Backend API Outline

Keep the API small and focused.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check backend status |
| `GET` | `/api/stocks` | Return the fixed stock list |
| `POST` | `/api/market-data/fetch` | Fetch and store data for selected approved symbols and date range |
| `GET` | `/api/market-data/{symbol}` | Return stored price history |
| `GET` | `/api/analysis/{symbol}` | Return daily returns and descriptive statistics |
| `GET` | `/api/correlation` | Return covariance and correlation matrices for selected symbols |
| `POST` | `/api/portfolio/calculate` | Calculate a two-stock portfolio |

### API rules
- Validate symbols against the fixed stock universe.
- Validate date ranges and portfolio weights.
- Return consistent JSON response shapes.
- Handle upstream Yahoo Finance errors without crashing the backend.
- Do not expose database credentials or internal exception traces to the frontend.
- Keep calculations in a dedicated service/module rather than duplicating formulas inside route handlers.

---

## 9. Suggested Project Structure

```text
stock-market-analyzer/
├── IDEA.md
├── README.md
├── .env.example
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── stock_universe.py
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── stocks.py
│   │   │   ├── market_data.py
│   │   │   └── analysis.py
│   │   ├── services/
│   │   │   ├── market_data_service.py
│   │   │   ├── statistics_service.py
│   │   │   └── portfolio_service.py
│   │   └── schemas/
│   │       └── analysis.py
│   ├── tests/
│   │   ├── test_statistics.py
│   │   ├── test_portfolio.py
│   │   └── test_api.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── StockAnalysis.tsx
    │   │   ├── CorrelationAnalysis.tsx
    │   │   └── PortfolioCalculator.tsx
    │   ├── services/
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

The agent may adjust filenames to fit the existing repository, but must preserve the small architecture and responsibilities.

---

## 10. Design Direction

Create a clean, modern financial-data interface suitable for a college presentation. Prioritize readable numbers, charts, tables, and explanations.

### Visual style
- Professional, calm, and analytical.
- Dark-first interface with a working light theme only if it is straightforward.
- Avoid excessive gradients, glassmorphism, neon effects, heavy borders, and unnecessary animations.
- Use a restrained blue accent.
- Use green for positive values and red only where needed to communicate negative values or risk—not as a dominant brand color.

### Dark palette
- Background: `#0B1020`
- Surface: `#111827`
- Elevated surface: `#182235`
- Border: `#293548`
- Primary text: `#F3F6FC`
- Secondary text: `#A8B3C7`
- Accent: `#60A5FA`
- Positive: `#34D399`
- Negative: `#F87171`
- Warning: `#FBBF24`

### Typography and layout
- Use Inter or a clean system sans-serif font.
- Use consistent spacing and clear page headings.
- Make tables and charts readable on a laptop/projector.
- Ensure responsive behavior at common laptop and tablet widths.
- Provide clear labels and accessible contrast.

### Reusable components
Create only components that are actually needed:
- App layout/navigation
- Page header
- Stock selector
- Date-range selector
- Metric/statistic card
- Chart container
- Data table
- Loading state
- Empty state
- Error message
- Formula explanation panel

---

## 11. Data Accuracy and Statistical Rules

These rules are important for academic correctness.

1. Use actual historical data fetched from Yahoo Finance.
2. Use adjusted close for returns when available; otherwise use close and identify the field.
3. Sort observations by date before calculating returns.
4. Calculate returns only between consecutive available observations for that stock.
5. Do not replace missing prices or returns with zero.
6. When comparing multiple stocks, align their returns by date and use common dates.
7. Use sample variance and sample standard deviation (`ddof=1`) consistently.
8. Use the same aligned return observations in the portfolio formula and observed portfolio-return series.
9. Label daily and annualized statistics correctly.
10. Explain that historical return and risk statistics describe the selected sample period; they do not predict or guarantee future results.
11. Do not present the application as providing investment advice.
12. If the sample contains too few valid observations to calculate a statistic, return a clear message rather than a misleading value.

---

## 12. Explicitly Out of Scope

Do not implement any of the following:

- User registration, login, roles, or profile management.
- Admin dashboard or approval workflows.
- Payment systems, brokerage connections, or trading.
- Buy/sell recommendations or investment advice.
- Automated trade execution.
- Real-time streaming market feeds.
- News feeds or sentiment analysis.
- Complex multi-asset portfolio optimization.
- Efficient frontier.
- Sharpe ratio or risk-free-rate modelling.
- Monte Carlo simulation.
- Machine learning or stock-price prediction.
- Advanced normality testing or fat-tail research.
- Subscription plans or recurring workflows.
- Microservices or distributed architecture.
- Cloud deployment, unless explicitly requested and approved.
- Elaborate infrastructure, monitoring, or CI/CD setup.

These features are intentionally excluded because the project is focused on demonstrating fetched data, statistical calculations, and graphs in a presentation.

---

## 13. Implementation Milestones

Work in small, reviewable stages. Do not build everything at once.

### Milestone 0 — Repository inspection and plan
- Inspect the existing repository.
- Read this entire `IDEA.md`.
- Identify existing code and environment.
- Propose a short implementation plan.
- Do not modify files until the plan is approved.

### Milestone 1 — Basic project setup
- Set up FastAPI backend.
- Set up React + Vite frontend.
- Add environment configuration and `.env.example`.
- Add a health endpoint.
- Confirm both applications run locally.

### Milestone 2 — MongoDB and stock list
- Connect to MongoDB.
- Define the ten approved stocks in one canonical module.
- Create the required `stocks` metadata records without inserting fake market prices.
- Verify database connectivity and stock-list API.

### Milestone 3 — Historical data fetching
- Integrate `yfinance`.
- Fetch daily historical data for selected approved stocks.
- Store observations in MongoDB using upserts.
- Build the historical data API and table.
- Add loading, empty, and error states.

### Milestone 4 — Statistical calculations
- Implement daily returns, mean, sample variance, standard deviation, annualized volatility, covariance, and correlation.
- Add unit tests using small, explicitly defined test datasets.
- Display formulas and calculation results in the UI.

### Milestone 5 — Charts and correlation analysis
- Add historical price and daily-return charts.
- Add volatility comparison.
- Add correlation heatmap and covariance table.
- Verify all charts use fetched or calculated data.

### Milestone 6 — Two-stock portfolio calculator
- Implement validated weights.
- Calculate portfolio mean, variance, and standard deviation.
- Compare formula variance with observed portfolio-return variance.
- Add the portfolio comparison visualization and formula explanation.

### Milestone 7 — Presentation readiness
- Test the complete user flow.
- Check calculations and labels.
- Verify empty/error/loading states.
- Improve layout and readability.
- Update README with setup instructions and a short presentation walkthrough.

---

## 14. AI Coding Agent Instructions

The agent must follow these rules throughout implementation.

### Source of truth
- This `IDEA.md` is the canonical source of truth.
- Read the full document before coding.
- Do not expand the project beyond the defined scope.
- Do not silently change the stock universe, formulas, technology stack, database, or page structure.

### Work process
- Inspect the repository before editing.
- Work milestone by milestone.
- Present a concise plan before substantial implementation.
- Avoid unnecessary abstractions and dependencies.
- Prefer understandable code that the student can explain during a presentation.
- Do not overwrite unrelated existing work.

### Human approval required
Pause and ask the project owner before:
- Installing software that requires elevated permissions.
- Creating or using external cloud accounts or paid services.
- Introducing a new technology or changing the approved stack.
- Changing any approved stock ticker.
- Performing destructive database operations or resetting existing data.
- Deploying publicly or incurring cloud costs.
- Expanding the scope beyond this document.

Never ask the user to expose secrets in chat. Use local environment variables and `.env` files.

### Data integrity
- Never invent or seed fake historical market prices.
- Never claim a fetch succeeded unless it actually succeeded.
- Report missing or unavailable ticker data honestly.
- Do not silently substitute another stock.
- Keep source and data-date information visible.

### Verification
At the end of each milestone:
- Run relevant tests.
- Run available lint/type checks.
- Report the exact commands executed.
- Report actual pass/fail results.
- List files created or changed.
- Mention known limitations and the next milestone.

Do not claim tests, builds, or database operations passed unless they were actually run.

---

## 15. Acceptance Criteria

The project is ready for its presentation when all of the following work:

- [ ] The application starts locally using documented instructions.
- [ ] The fixed list of ten approved NSE stocks is available.
- [ ] The user can select a stock and date range.
- [ ] Historical market data can be fetched from Yahoo Finance.
- [ ] Fetched data is stored in MongoDB without duplicate `(symbol, date)` records.
- [ ] The UI displays the fetched OHLCV data.
- [ ] Daily returns are calculated correctly.
- [ ] Mean, sample variance, standard deviation, and annualized volatility are displayed.
- [ ] Covariance and correlation can be calculated for selected stocks.
- [ ] A correlation heatmap is displayed.
- [ ] The user can calculate a two-stock portfolio using weights totaling 100%.
- [ ] Portfolio variance from the formula matches observed portfolio-return variance within numerical tolerance.
- [ ] Historical price, daily-return, volatility, correlation, and portfolio graphs are visible.
- [ ] The application explains formulas and displays the values used.
- [ ] Missing data and API failures are handled clearly.
- [ ] No fake market prices or out-of-scope features have been added.

---

## 16. Suggested Presentation Flow

Use this sequence for a short classroom demonstration:

1. **Introduce the problem:** Stock prices change every trading day, and different stocks can move differently.
2. **Fetch data:** Select a stock and date range; show the historical data retrieved from Yahoo Finance.
3. **Show price movement:** Explain the closing-price chart.
4. **Calculate daily return:** Pick two consecutive observations and demonstrate the percentage-return formula.
5. **Explain risk:** Show mean return, variance, and standard deviation.
6. **Compare stocks:** Open the correlation heatmap and explain one positively or weakly correlated pair using the actual result.
7. **Build a portfolio:** Select two stocks, enter allocation weights, and show the portfolio-risk calculation.
8. **Conclude:** Explain how statistical calculations and visualizations help describe historical stock behavior and diversification.

The presenter should use the actual values returned by the application. Do not prepare a script that assumes a particular correlation, return, or risk result in advance.

---

## Final Principle

**Keep it small, correct, visual, and explainable.**

The project succeeds when a student can fetch real historical stock data, show the underlying calculations, explain the formulas, and demonstrate the results through clear graphs. Every feature should directly support that objective.
"""

path = Path("/mnt/data/IDEA.md")
path.write_text(content, encoding="utf-8")
print(f"Created {path} ({len(content.splitlines())} lines, {path.stat().st_size:,} bytes)")

Analysis errored
Python

from pathlib import Path

content = r"""# Stock Market Risk & Correlation Analyzer

> **Project purpose:** A focused academic application that fetches real historical stock-market data, demonstrates statistical calculations step by step, and presents the results through clear graphs.

This document is the single source of truth for the project. Read it completely before making implementation changes. The application is intended for a classroom demonstration and presentation. Keep the implementation small, understandable, and reliable.

---

## 1. Project Overview

### Project name
**Stock Market Risk & Correlation Analyzer**

### Short description
A web application that retrieves historical prices for a fixed set of NSE-listed stocks, calculates basic return and risk statistics, explores how stocks move in relation to one another, and visualizes the results.

### Core presentation goal
The application should make it easy to demonstrate:
1. Where historical stock data comes from.
2. How daily returns are calculated from closing prices.
3. How mean return, variance, and standard deviation are calculated.
4. What covariance and correlation tell us about two stocks.
5. How combining two stocks affects portfolio risk.
6. How the calculations are represented in tables and graphs.

**The mathematics and its explanation are the main feature.** Do not turn this into a large financial platform.

### Intended users
- Student presenting the project.
- Faculty evaluating the calculations and implementation.
- Anyone viewing the charts and wanting to understand the basic statistical concepts.

### Scope statement
Build a small, functional academic application. Do not describe or label the application as a “prototype.” It is the project application for demonstrating the stated concepts.

---

## 2. Fixed Stock Universe

Use exactly these ten stocks and Yahoo Finance NSE ticker symbols:

| # | Company | Yahoo Finance ticker | Sector |
|---:|---|---|---|
| 1 | Solar Industries India | `SOLARINDS.NS` | Chemicals & Explosives |
| 2 | Bajaj Finance | `BAJFINANCE.NS` | Financial Services |
| 3 | Titan Company | `TITAN.NS` | Consumer Discretionary |
| 4 | Eicher Motors | `EICHERMOT.NS` | Automobile |
| 5 | Pidilite Industries | `PIDILITIND.NS` | Chemicals & Adhesives |
| 6 | Infosys | `INFY.NS` | IT |
| 7 | Tata Consultancy Services | `TCS.NS` | IT |
| 8 | Asian Paints | `ASIANPAINT.NS` | Consumer Goods & Paints |
| 9 | Ajanta Pharma | `AJANTPHARM.NS` | Pharmaceuticals |
| 10 | Havells India | `HAVELLS.NS` | Consumer Electricals |

### Stock-universe rules
- Do not add other tickers.
- Do not silently replace a ticker if Yahoo Finance returns an error, a ticker is renamed, or data is unavailable.
- If a ticker cannot be resolved, stop that stock's ingestion and report the issue clearly. Ask the project owner to verify the mapping before changing it.
- The interface should let the presenter select from this fixed list.

---

## 3. Functional Requirements

### 3.1 Fetch historical stock data

Use `yfinance` to fetch daily historical data for the fixed stock list.

Requirements:
- Provide a simple date-range selector.
- Use daily interval data.
- Retrieve available OHLCV fields: Open, High, Low, Close, Adjusted Close (when supplied), and Volume.
- Show the selected stock, ticker, date range, and most recent available market-data date.
- Handle weekends, exchange holidays, missing observations, network errors, and invalid date ranges gracefully.
- Show a visible loading state while fetching.
- Show a useful error or empty state if data cannot be fetched.
- Do not claim data is real-time. Yahoo Finance historical data may be delayed or unavailable for the current trading day.
- Do not generate fake prices or fabricated historical observations.

Use adjusted closing prices for return calculations when available. If adjusted close is unavailable, use close and clearly display which price field was used.

### 3.2 Display fetched data

Provide a compact historical-data table with:
- Date
- Open
- High
- Low
- Close
- Adjusted Close, if available
- Volume

The table should support sorting by date, a reasonable default number of visible rows, and simple pagination or a limited display with a clear way to inspect more rows. Numeric formatting must be readable and consistent.

### 3.3 Calculate daily returns

Use simple daily returns as the primary measure:

\[
R_t = \frac{P_t-P_{t-1}}{P_{t-1}}
\]

Where:
- \(P_t\) is the selected adjusted closing price on day \(t\).
- \(P_{t-1}\) is the previous available trading day's adjusted closing price.

Display date, previous adjusted close, current adjusted close, and daily return as a percentage. The first observation has no previous price and therefore no daily return. Do not fill it with zero.

### 3.4 Calculate descriptive statistics

For each selected stock, calculate and display:

**Mean daily return**

\[
\bar R = \frac{1}{n}\sum_{t=1}^{n}R_t
\]

**Sample variance**

\[
s^2 = \frac{1}{n-1}\sum_{t=1}^{n}(R_t-\bar R)^2
\]

**Sample standard deviation**

\[
s = \sqrt{s^2}
\]

Use sample variance and standard deviation (`ddof=1`).

Also show annualized volatility for context:

\[
\sigma_{\text{annual}} = s_{\text{daily}}\sqrt{252}
\]

If annualized mean return is displayed, label it as an arithmetic annualization:

\[
\mu_{\text{annual}} = \bar R_{\text{daily}}\times252
\]

Do not present these historical statistics as guaranteed future performance.

### 3.5 Covariance and correlation

For selected stocks, calculate:
- Covariance matrix of daily returns.
- Pearson correlation matrix of daily returns.

**Sample covariance**

\[
Cov(X,Y)=\frac{\sum_{i=1}^{n}(X_i-\bar X)(Y_i-\bar Y)}{n-1}
\]

**Pearson correlation**

\[
\rho_{X,Y}=\frac{Cov(X,Y)}{s_Xs_Y}
\]

Explain the correlation scale:
- Near `+1`: the two return series tend to move in the same direction.
- Near `0`: little linear relationship is observed.
- Near `-1`: the two return series tend to move in opposite directions.

Use dates common to both stocks when comparing their returns. Do not align unrelated observations by row position if their dates differ.

### 3.6 Two-stock portfolio calculator

This is the only portfolio feature required.

Allow the user to:
1. Select two stocks from the fixed stock list.
2. Enter the allocation percentage for Stock A.
3. Enter the allocation percentage for Stock B, or calculate it as the remainder.
4. Validate that both weights are between 0 and 1 and sum to 1 (100%).
5. View the calculated portfolio return and risk.

Portfolio daily return:

\[
R_p=w_1R_1+w_2R_2
\]

Expected portfolio daily return using historical arithmetic means:

\[
\mu_p=w_1\mu_1+w_2\mu_2
\]

Portfolio variance:

\[
\sigma_p^2=w_1^2\sigma_1^2+w_2^2\sigma_2^2+2w_1w_2Cov(R_1,R_2)
\]

Portfolio standard deviation:

\[
\sigma_p=\sqrt{\sigma_p^2}
\]

Display selected stocks, allocation weights, individual mean daily returns, individual standard deviations, covariance and correlation, portfolio mean daily return, portfolio variance, portfolio standard deviation, and annualized portfolio volatility if useful.

Show the formula and the actual input values used in the calculation so the presenter can explain the result.

Use aligned daily return observations for both stocks. Calculate the observed portfolio return series using the same weights and dates.

**Validation requirement:** The variance from the theoretical formula should match the sample variance of the calculated portfolio return series within a small numerical tolerance, provided the same aligned observations, weights, and sample covariance convention are used.

Do not add short selling, leverage, automated trading, or a complex optimization engine.

---

## 4. Graphs and Visualizations

The graphs should be generated from fetched market data and calculated returns, not decorative sample values.

### Required charts

1. **Historical closing-price line chart**
   - X-axis: trading date.
   - Y-axis: selected price field.
   - Allow the presenter to select a stock.

2. **Daily-return chart**
   - Plot daily returns over time.
   - Clearly label the y-axis as daily return (%).

3. **Stock volatility comparison**
   - Bar chart comparing daily or annualized volatility for selected stocks.
   - State which volatility measure is displayed.

4. **Correlation heatmap**
   - Show the Pearson correlation matrix for the ten stocks or a selected subset.
   - Use a diverging scale centered at zero.
   - Show the numerical correlation value on hover or in the cell where practical.
   - Use consistent stock labels.

5. **Two-stock portfolio comparison**
   - Compare the individual stocks' historical volatility with the combined portfolio's volatility.
   - Clearly identify the selected allocation weights.
   - Do not imply that diversification always reduces risk.

### Chart quality
- Every chart needs a title, axis labels, units, and a short explanation.
- Tooltips should show readable dates and numeric values.
- Avoid clutter, unnecessary animation, 3D charts, and decorative chart effects.
- Provide an empty state when insufficient data is available.

---

## 5. Application Pages

Keep the application to four main pages.

### Page 1 — Dashboard
Purpose: give the presenter a quick overview.

Include:
- Project title and short description.
- Data source label: Yahoo Finance via `yfinance`.
- Latest available data date.
- Number of stocks in the fixed universe.
- A small selection of key statistics for a selected stock.
- A historical price chart.
- A clear route to the analysis pages.

Do not add elaborate market-news feeds, user accounts, or unrelated dashboard widgets.

### Page 2 — Stock Analysis
Purpose: demonstrate fetched data and calculations for one stock.

Include:
- Stock selector.
- Date-range selector.
- Historical OHLCV table.
- Historical closing-price chart.
- Daily-return table or preview.
- Mean daily return, variance, standard deviation, and annualized volatility.
- A calculation explanation showing the formula and the values used.

### Page 3 — Correlation Analysis
Purpose: explain how stocks move in relation to one another.

Include:
- Correlation heatmap.
- Correlation matrix values.
- Covariance matrix values, accessible in a simple table.
- A two-stock selector for a focused comparison.
- Short plain-language interpretation of the selected pair's correlation.

### Page 4 — Portfolio Calculator
Purpose: demonstrate how two assets combine into a portfolio.

Include:
- Two stock selectors.
- Two allocation inputs that total 100%.
- Portfolio calculation results.
- Formula and substituted values.
- Individual-versus-portfolio risk comparison chart.
- A short explanation of how covariance affects portfolio risk.

---

## 6. Technology Stack

Use this stack unless the project owner explicitly approves a change.

### Backend
- Python 3.11+
- FastAPI
- Uvicorn
- yfinance
- Pandas
- NumPy
- PyMongo
- Pydantic
- python-dotenv
- Python standard logging

### Database
- MongoDB only.
- Local MongoDB Community Server is preferred for a straightforward local academic setup.
- MongoDB Atlas may be used only after the project owner approves the external service and provides credentials.
- Do not introduce SQL databases.

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- React Router
- TanStack Query (use only where it simplifies API data fetching)

Keep dependencies limited. Do not add libraries without a clear need.

### Testing and quality
- pytest
- FastAPI TestClient or HTTPX
- Vitest for essential frontend logic
- Ruff for Python linting/formatting
- ESLint and Prettier for frontend code

Do not build an elaborate testing or deployment platform. Prioritize tests for calculations, data alignment, API behavior, and important user flows.

---

## 7. MongoDB Data Design

Database name: `stock_market_analyzer`

Use only the following essential collections.

### 7.1 `stocks`
Stores metadata for the fixed ten-stock universe.

Example document:

```json
{
  "symbol": "SOLARINDS.NS",
  "company_name": "Solar Industries India",
  "sector": "Chemicals & Explosives",
  "exchange": "NSE"
}
```

### 7.2 `prices`
Stores fetched daily market observations.

Example document:

```json
{
  "symbol": "SOLARINDS.NS",
  "date": "BSON Date",
  "open": 0.0,
  "high": 0.0,
  "low": 0.0,
  "close": 0.0,
  "adjusted_close": 0.0,
  "volume": 0,
  "source": "Yahoo Finance"
}
```

Use actual numeric values from the data provider; the zeroes above are schema placeholders only, not market data.

Create a unique compound index on `(symbol, date)` to prevent duplicate daily records.

### Database behavior
- Store dates as BSON Date values, not formatted date strings.
- Upsert fetched observations so repeating a data fetch does not create duplicates.
- Store only actual provider data.
- Do not seed fabricated prices.
- The `stocks` collection may be initialized with the ten approved metadata records.
- The application should continue to work if the database has no historical price records yet; show an appropriate data-fetch action or empty state.

### Academic DBMS explanation
The `prices` collection represents the price table concept. Daily returns are derived from ordered price records using Pandas or a MongoDB aggregation pipeline. A materialized `returns` collection is not required for this small application. Explain this distinction during the presentation if asked about the original table/view concept.

---

## 8. Backend API Outline

Keep the API small and focused.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check backend status |
| `GET` | `/api/stocks` | Return the fixed stock list |
| `POST` | `/api/market-data/fetch` | Fetch and store data for selected approved symbols and date range |
| `GET` | `/api/market-data/{symbol}` | Return stored price history |
| `GET` | `/api/analysis/{symbol}` | Return daily returns and descriptive statistics |
| `GET` | `/api/correlation` | Return covariance and correlation matrices for selected symbols |
| `POST` | `/api/portfolio/calculate` | Calculate a two-stock portfolio |

### API rules
- Validate symbols against the fixed stock universe.
- Validate date ranges and portfolio weights.
- Return consistent JSON response shapes.
- Handle upstream Yahoo Finance errors without crashing the backend.
- Do not expose database credentials or internal exception traces to the frontend.
- Keep calculations in a dedicated service/module rather than duplicating formulas inside route handlers.

---

## 9. Suggested Project Structure

```text
stock-market-analyzer/
├── IDEA.md
├── README.md
├── .env.example
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── stock_universe.py
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── stocks.py
│   │   │   ├── market_data.py
│   │   │   └── analysis.py
│   │   ├── services/
│   │   │   ├── market_data_service.py
│   │   │   ├── statistics_service.py
│   │   │   └── portfolio_service.py
│   │   └── schemas/
│   │       └── analysis.py
│   ├── tests/
│   │   ├── test_statistics.py
│   │   ├── test_portfolio.py
│   │   └── test_api.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── StockAnalysis.tsx
    │   │   ├── CorrelationAnalysis.tsx
    │   │   └── PortfolioCalculator.tsx
    │   ├── services/
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

The agent may adjust filenames to fit the existing repository, but must preserve the small architecture and responsibilities.

---

## 10. Design Direction

Create a clean, modern financial-data interface suitable for a college presentation. Prioritize readable numbers, charts, tables, and explanations.

### Visual style
- Professional, calm, and analytical.
- Dark-first interface with a working light theme only if it is straightforward.
- Avoid excessive gradients, glassmorphism, neon effects, heavy borders, and unnecessary animations.
- Use a restrained blue accent.
- Use green for positive values and red only where needed to communicate negative values or risk—not as a dominant brand color.

### Dark palette
- Background: `#0B1020`
- Surface: `#111827`
- Elevated surface: `#182235`
- Border: `#293548`
- Primary text: `#F3F6FC`
- Secondary text: `#A8B3C7`
- Accent: `#60A5FA`
- Positive: `#34D399`
- Negative: `#F87171`
- Warning: `#FBBF24`

### Typography and layout
- Use Inter or a clean system sans-serif font.
- Use consistent spacing and clear page headings.
- Make tables and charts readable on a laptop/projector.
- Ensure responsive behavior at common laptop and tablet widths.
- Provide clear labels and accessible contrast.

### Reusable components
Create only components that are actually needed:
- App layout/navigation
- Page header
- Stock selector
- Date-range selector
- Metric/statistic card
- Chart container
- Data table
- Loading state
- Empty state
- Error message
- Formula explanation panel

---

## 11. Data Accuracy and Statistical Rules

These rules are important for academic correctness.

1. Use actual historical data fetched from Yahoo Finance.
2. Use adjusted close for returns when available; otherwise use close and identify the field.
3. Sort observations by date before calculating returns.
4. Calculate returns only between consecutive available observations for that stock.
5. Do not replace missing prices or returns with zero.
6. When comparing multiple stocks, align their returns by date and use common dates.
7. Use sample variance and sample standard deviation (`ddof=1`) consistently.
8. Use the same aligned return observations in the portfolio formula and observed portfolio-return series.
9. Label daily and annualized statistics correctly.
10. Explain that historical return and risk statistics describe the selected sample period; they do not predict or guarantee future results.
11. Do not present the application as providing investment advice.
12. If the sample contains too few valid observations to calculate a statistic, return a clear message rather than a misleading value.

---

## 12. Explicitly Out of Scope

Do not implement:
- User registration, login, roles, or profile management.
- Admin dashboard or approval workflows.
- Payment systems, brokerage connections, or trading.
- Buy/sell recommendations or investment advice.
- Automated trade execution.
- Real-time streaming market feeds.
- News feeds or sentiment analysis.
- Complex multi-asset portfolio optimization.
- Efficient frontier.
- Sharpe ratio or risk-free-rate modelling.
- Monte Carlo simulation.
- Machine learning or stock-price prediction.
- Advanced normality testing or fat-tail research.
- Subscription plans or recurring workflows.
- Microservices or distributed architecture.
- Cloud deployment, unless explicitly requested and approved.
- Elaborate infrastructure, monitoring, or CI/CD setup.

These features are intentionally excluded because the project is focused on demonstrating fetched data, statistical calculations, and graphs in a presentation.

---

## 13. Implementation Milestones

Work in small, reviewable stages. Do not build everything at once.

### Milestone 0 — Repository inspection and plan
- Inspect the existing repository.
- Read this entire `IDEA.md`.
- Identify existing code and environment.
- Propose a short implementation plan.
- Do not modify files until the plan is approved.

### Milestone 1 — Basic project setup
- Set up FastAPI backend.
- Set up React + Vite frontend.
- Add environment configuration and `.env.example`.
- Add a health endpoint.
- Confirm both applications run locally.

### Milestone 2 — MongoDB and stock list
- Connect to MongoDB.
- Define the ten approved stocks in one canonical module.
- Create the required `stocks` metadata records without inserting fake market prices.
- Verify database connectivity and stock-list API.

### Milestone 3 — Historical data fetching
- Integrate `yfinance`.
- Fetch daily historical data for selected approved stocks.
- Store observations in MongoDB using upserts.
- Build the historical data API and table.
- Add loading, empty, and error states.

### Milestone 4 — Statistical calculations
- Implement daily returns, mean, sample variance, standard deviation, annualized volatility, covariance, and correlation.
- Add unit tests using small, explicitly defined test datasets.
- Display formulas and calculation results in the UI.

### Milestone 5 — Charts and correlation analysis
- Add historical price and daily-return charts.
- Add volatility comparison.
- Add correlation heatmap and covariance table.
- Verify all charts use fetched or calculated data.

### Milestone 6 — Two-stock portfolio calculator
- Implement validated weights.
- Calculate portfolio mean, variance, and standard deviation.
- Compare formula variance with observed portfolio-return variance.
- Add the portfolio comparison visualization and formula explanation.

### Milestone 7 — Presentation readiness
- Test the complete user flow.
- Check calculations and labels.
- Verify empty/error/loading states.
- Improve layout and readability.
- Update README with setup instructions and a short presentation walkthrough.

---

## 14. AI Coding Agent Instructions

The agent must follow these rules throughout implementation.

### Source of truth
- This `IDEA.md` is the canonical source of truth.
- Read the full document before coding.
- Do not expand the project beyond the defined scope.
- Do not silently change the stock universe, formulas, technology stack, database, or page structure.

### Work process
- Inspect the repository before editing.
- Work milestone by milestone.
- Present a concise plan before substantial implementation.
- Avoid unnecessary abstractions and dependencies.
- Prefer understandable code that the student can explain during a presentation.
- Do not overwrite unrelated existing work.

### Human approval required
Pause and ask the project owner before:
- Installing software that requires elevated permissions.
- Creating or using external cloud accounts or paid services.
- Introducing a new technology or changing the approved stack.
- Changing any approved stock ticker.
- Performing destructive database operations or resetting existing data.
- Deploying publicly or incurring cloud costs.
- Expanding the scope beyond this document.

Never ask the user to expose secrets in chat. Use local environment variables and `.env` files.

### Data integrity
- Never invent or seed fake historical market prices.
- Never claim a fetch succeeded unless it actually succeeded.
- Report missing or unavailable ticker data honestly.
- Do not silently substitute another stock.
- Keep source and data-date information visible.

### Verification
At the end of each milestone:
- Run relevant tests.
- Run available lint/type checks.
- Report the exact commands executed.
- Report actual pass/fail results.
- List files created or changed.
- Mention known limitations and the next milestone.

Do not claim tests, builds, or database operations passed unless they were actually run.

---

## 15. Acceptance Criteria

The project is ready for its presentation when all of the following work:

- [ ] The application starts locally using documented instructions.
- [ ] The fixed list of ten approved NSE stocks is available.
- [ ] The user can select a stock and date range.
- [ ] Historical market data can be fetched from Yahoo Finance.
- [ ] Fetched data is stored in MongoDB without duplicate `(symbol, date)` records.
- [ ] The UI displays the fetched OHLCV data.
- [ ] Daily returns are calculated correctly.
- [ ] Mean, sample variance, standard deviation, and annualized volatility are displayed.
- [ ] Covariance and correlation can be calculated for selected stocks.
- [ ] A correlation heatmap is displayed.
- [ ] The user can calculate a two-stock portfolio using weights totaling 100%.
- [ ] Portfolio variance from the formula matches observed portfolio-return variance within numerical tolerance.
- [ ] Historical price, daily-return, volatility, correlation, and portfolio graphs are visible.
- [ ] The application explains formulas and displays the values used.
- [ ] Missing data and API failures are handled clearly.
- [ ] No fake market prices or out-of-scope features have been added.

---

## 16. Suggested Presentation Flow

Use this sequence for a short classroom demonstration:

1. **Introduce the problem:** Stock prices change every trading day, and different stocks can move differently.
2. **Fetch data:** Select a stock and date range; show the historical data retrieved from Yahoo Finance.
3. **Show price movement:** Explain the closing-price chart.
4. **Calculate daily return:** Pick two consecutive observations and demonstrate the percentage-return formula.
5. **Explain risk:** Show mean return, variance, and standard deviation.
6. **Compare stocks:** Open the correlation heatmap and explain one positively or weakly correlated pair using the actual result.
7. **Build a portfolio:** Select two stocks, enter allocation weights, and show the portfolio-risk calculation.
8. **Conclude:** Explain how statistical calculations and visualizations help describe historical stock behavior and diversification.

The presenter should use the actual values returned by the application. Do not prepare a script that assumes a particular correlation, return, or risk result in advance.

---

## Final Principle

**Keep it small, correct, visual, and explainable.**

The project succeeds when a student can fetch real historical stock data, show the underlying calculations, explain the formulas, and demonstrate the results through clear graphs. Every feature should directly support that objective.
"""
