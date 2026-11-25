import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { fetchStocks, fetchStockAnalysis, fetchMarketData } from '../services/api';
import type { StockMetadata, StockAnalysisResponse, PriceRecord, DailyReturnRecord } from '../types';
import { PageHeader } from '../components/PageHeader';
import { StockSelector } from '../components/StockSelector';
import { DateRangeSelector } from '../components/DateRangeSelector';
import { StatCard } from '../components/StatCard';
import { ChartContainer } from '../components/ChartContainer';
import { DataTable, type Column } from '../components/DataTable';
import { FormulaCard } from '../components/FormulaCard';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/StatusStates';

export const StockAnalysis: React.FC = () => {
  const [stocks, setStocks] = useState<StockMetadata[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SOLARINDS.NS');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [priceField, setPriceField] = useState<string>('adjusted_close');
  const [analysis, setAnalysis] = useState<StockAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'prices' | 'returns'>('prices');

  useEffect(() => {
    fetchStocks()
      .then((data) => {
        setStocks(data);
        if (data.length > 0) {
          loadAnalysis(data[0].symbol, startDate, endDate, priceField);
        }
      })
      .catch((err) => setError(`Failed to fetch stock universe: ${err.message}`));
  }, []);

  const loadAnalysis = async (
    sym: string,
    start?: string,
    end?: string,
    field: string = 'adjusted_close'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStockAnalysis(sym, start, end, field);
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    loadAnalysis(symbol, startDate, endDate, priceField);
  };

  const handleDateChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
    loadAnalysis(selectedSymbol, start, end, priceField);
  };

  const handlePriceFieldToggle = (field: string) => {
    setPriceField(field);
    loadAnalysis(selectedSymbol, startDate, endDate, field);
  };

  const handleManualFetch = async () => {
    try {
      setFetchingData(true);
      setError(null);
      await fetchMarketData([selectedSymbol], startDate, endDate);
      await loadAnalysis(selectedSymbol, startDate, endDate, priceField);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetchingData(false);
    }
  };

  const stats = analysis?.statistics;
  const currentStock = stocks.find((s) => s.symbol === selectedSymbol);

  // Table Columns for OHLCV
  const priceColumns: Column<PriceRecord>[] = [
    { key: 'date', header: 'Session Date', sortable: true },
    {
      key: 'open',
      header: 'Open (₹)',
      align: 'right',
      render: (r) => `₹${r.open.toFixed(2)}`,
    },
    {
      key: 'high',
      header: 'High (₹)',
      align: 'right',
      render: (r) => `₹${r.high.toFixed(2)}`,
    },
    {
      key: 'low',
      header: 'Low (₹)',
      align: 'right',
      render: (r) => `₹${r.low.toFixed(2)}`,
    },
    {
      key: 'close',
      header: 'Close (₹)',
      align: 'right',
      render: (r) => `₹${r.close.toFixed(2)}`,
    },
    {
      key: 'adjusted_close',
      header: 'Adj Close (₹)',
      align: 'right',
      render: (r) => (
        <span className="text-blue-400 font-semibold font-mono tabular-nums">
          ₹{r.adjusted_close.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      align: 'right',
      render: (r) => r.volume.toLocaleString(),
    },
  ];

  // Table Columns for Returns Preview
  const returnColumns: Column<DailyReturnRecord>[] = [
    { key: 'date', header: 'Session Date', sortable: true },
    {
      key: 'prev_close',
      header: 'P(t-1) Price (₹)',
      align: 'right',
      render: (r) => `₹${r.prev_close.toFixed(2)}`,
    },
    {
      key: 'current_close',
      header: 'P(t) Price (₹)',
      align: 'right',
      render: (r) => `₹${r.current_close.toFixed(2)}`,
    },
    {
      key: 'return_value',
      header: 'Daily Return (decimal)',
      align: 'right',
      render: (r) => r.return_value.toFixed(6),
    },
    {
      key: 'return_pct',
      header: 'Daily Return (%)',
      align: 'right',
      render: (r) => {
        const isPos = r.return_pct >= 0;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold font-mono tabular-nums ${
              isPos ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPos ? `+${r.return_pct.toFixed(2)}%` : `${r.return_pct.toFixed(2)}%`}
          </span>
        );
      },
    },
  ];

  const priceChartData = (analysis?.prices || []).map((p) => ({
    date: p.date,
    price: priceField === 'close' ? p.close : p.adjusted_close || p.close,
  }));

  const returnChartData = (analysis?.returns_preview || []).map((r) => ({
    date: r.date,
    return_pct: r.return_pct,
  }));

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Stock Analysis &amp; Descriptive Statistics"
        subtitle="Retrieve OHLCV market observations, calculate daily returns, and inspect variance &amp; volatility step by step."
        badge="Single Instrument Drill-down"
        actionSlot={
          <button
            onClick={handleManualFetch}
            disabled={fetchingData}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingData ? 'animate-spin' : ''}`} />
            <span>{fetchingData ? 'Fetching Data...' : 'Re-Fetch Ticker'}</span>
          </button>
        }
      />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Control Bar: Stock selector, date range, price field selector */}
      <div className="bg-[#111827] border border-[#293548] rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5">
          <StockSelector
            label="Selected Stock"
            stocks={stocks}
            selectedSymbol={selectedSymbol}
            onSelect={handleStockChange}
          />
        </div>

        <div className="md:col-span-4">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onRangeChange={handleDateChange}
          />
        </div>

        <div className="md:col-span-3 space-y-1.5 md:text-right">
          <label className="block text-xs font-semibold text-[#8794AA] uppercase tracking-wide">
            Price Field Used
          </label>
          <div className="neu-inset p-1 rounded-xl inline-flex space-x-1 text-xs">
            <button
              onClick={() => handlePriceFieldToggle('adjusted_close')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                priceField === 'adjusted_close'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#A8B3C7] hover:text-[#F3F6FC]'
              }`}
            >
              Adjusted Close
            </button>
            <button
              onClick={() => handlePriceFieldToggle('close')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                priceField === 'close'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#A8B3C7] hover:text-[#F3F6FC]'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message={`Retrieving market data & calculating statistics for ${selectedSymbol}...`} />
      ) : analysis && analysis.total_records > 0 ? (
        <div className="space-y-8">
          {/* Key Descriptive Statistics Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8794AA]">
                Calculated Descriptive Statistics ({analysis.statistics?.sample_size} Daily Return Observations)
              </h2>
              <span className="text-[11px] text-[#8794AA]">Sample Convention: Bessel's Correction (ddof=1)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Mean Daily Return (R̄)"
                value={
                  stats
                    ? `${stats.mean_daily_return_pct >= 0 ? '+' : ''}${stats.mean_daily_return_pct.toFixed(4)}%`
                    : '0.0000%'
                }
                subtext="Arithmetic average daily return"
                formulaNote="R̄ = (1/n) Σ R_t"
                variant={(stats?.mean_daily_return ?? 0) >= 0 ? 'positive' : 'negative'}
              />
              <StatCard
                title="Sample Variance (s²)"
                value={stats?.sample_variance.toFixed(8) ?? '0.00000000'}
                subtext="Bessel's correction (ddof = 1)"
                formulaNote="s² = Σ(R_t - R̄)² / (n - 1)"
                variant="default"
              />
              <StatCard
                title="Daily Volatility (s)"
                value={`${stats?.sample_std_dev_pct.toFixed(4) ?? '0.0000'}%`}
                subtext="Sample standard deviation"
                formulaNote="s = √(s²)"
                variant="accent"
              />
              <StatCard
                title="Annualized Volatility"
                value={`${stats?.annualized_volatility_pct.toFixed(2) ?? '0.00'}%`}
                subtext="Scaled by √252 trading days"
                formulaNote="σ = s_daily × √252"
                variant="warning"
              />
              <StatCard
                title="Annualized Return"
                value={
                  stats
                    ? `${stats.annualized_mean_return_pct >= 0 ? '+' : ''}${stats.annualized_mean_return_pct.toFixed(2)}%`
                    : '0.00%'
                }
                subtext="R̄_daily × 252 (arithmetic)"
                formulaNote="μ = R̄_daily × 252"
                variant={(stats?.annualized_mean_return ?? 0) >= 0 ? 'positive' : 'negative'}
              />
            </div>
          </div>

          {/* Charts: Closing Price Line Chart & Daily Returns Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Chart */}
            <ChartContainer
              title={`${currentStock?.company_name ?? selectedSymbol} — Closing Price Chart`}
              subtitle={`Plotted using ${priceField === 'adjusted_close' ? 'Adjusted Close' : 'Close'} (INR ₹)`}
              explanation="X-axis indicates trading sessions; Y-axis is closing price. Notice how trends emerge over consecutive trading days."
              height={320}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="stockPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#293548" strokeOpacity={0.4} />
                  <XAxis dataKey="date" stroke="#8794AA" fontSize={11} tickLine={false} tickFormatter={(d) => d.slice(5)} />
                  <YAxis stroke="#8794AA" fontSize={11} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v.toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#293548', borderRadius: '12px', color: '#F3F6FC' }}
                    itemStyle={{ color: '#60A5FA' }}
                    labelStyle={{ color: '#8794AA' }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Closing Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke="#60A5FA" strokeWidth={2} fillOpacity={1} fill="url(#stockPriceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Daily Return Chart */}
            <ChartContainer
              title="Daily Returns Series (R_t %)"
              subtitle="Daily percentage fluctuations over time"
              explanation="Returns oscillate around the mean return line. Large swings indicate sessions of heightened volatility."
              height={320}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#293548" strokeOpacity={0.4} />
                  <XAxis dataKey="date" stroke="#8794AA" fontSize={11} tickLine={false} tickFormatter={(d) => d.slice(5)} />
                  <YAxis stroke="#8794AA" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#293548', borderRadius: '12px', color: '#F3F6FC' }}
                    itemStyle={{ color: '#60A5FA' }}
                    labelStyle={{ color: '#8794AA' }}
                    formatter={(val: any) => [`${Number(val).toFixed(4)}%`, 'Daily Return']}
                  />
                  <Bar dataKey="return_pct" fill="#60A5FA" radius={[2, 2, 0, 0]}>
                    {returnChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.return_pct >= 0 ? '#34D399' : '#F87171'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Academic Formula & Substituted Calculation Breakdown */}
          {analysis.formula_explanation && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8794AA]">
                Statistical Calculations &amp; Formula Explanations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormulaCard
                  title="Daily Simple Return"
                  formula="R_t = (P_t - P_{t-1}) / P_{t-1}"
                  description="Percentage change between consecutive market sessions. Observation 0 has no preceding price and is omitted (not zero-filled)."
                  academicNote="Simple returns represent exact single-period investor returns."
                />
                <FormulaCard
                  title="Sample Variance (ddof = 1)"
                  formula="s² = (1 / (n - 1)) × Σ(R_t - R̄)²"
                  description="Bessel's correction divides by (n - 1) instead of n, eliminating downward bias in estimating population variance from a sample."
                  inputs={{
                    'Sample Size (n)': stats?.sample_size ?? 0,
                    'Degrees of Freedom (n - 1)': (stats?.sample_size ?? 1) - 1,
                    'Mean Return (R̄)': stats?.mean_daily_return ?? 0,
                  }}
                  substitution={`Sum of squared deviations / ${(stats?.sample_size ?? 1) - 1}`}
                  result={`s² = ${stats?.sample_variance.toFixed(8)}`}
                  academicNote="Using ddof=1 is required for academic correctness."
                />
                <FormulaCard
                  title="Annualized Volatility"
                  formula="σ_annual = s_daily × √252"
                  description="Scaling daily standard deviation by the square root of 252 (the standard number of NSE trading sessions per calendar year)."
                  substitution={`${stats?.sample_std_dev.toFixed(6)} × √252`}
                  result={`σ = ${stats?.annualized_volatility_pct.toFixed(2)}%`}
                  academicNote="Annualization follows standard financial convention assuming independent daily return observations."
                />
              </div>
            </div>
          )}

          {/* Data Tables Section: Tabs for OHLCV Prices and Daily Returns */}
          <div className="bg-[#111827] border border-[#293548] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#293548]/60 gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('prices')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'prices'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-[#8794AA] hover:text-[#F3F6FC]'
                  }`}
                >
                  Historical OHLCV Records ({analysis.prices.length})
                </button>
                <button
                  onClick={() => setActiveTab('returns')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'returns'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-[#8794AA] hover:text-[#F3F6FC]'
                  }`}
                >
                  Daily Returns Series ({analysis.returns_preview.length})
                </button>
              </div>
              <div className="text-xs text-[#8794AA]">
                Click column headers to sort by session date or numeric values.
              </div>
            </div>

            {activeTab === 'prices' ? (
              <DataTable
                data={analysis.prices}
                columns={priceColumns}
                pageSizeDefault={10}
                emptyMessage="No price records found for this selection."
              />
            ) : (
              <DataTable
                data={analysis.returns_preview}
                columns={returnColumns}
                pageSizeDefault={10}
                emptyMessage="No returns calculated yet."
              />
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title={`No stored market data for ${selectedSymbol}`}
          description={`MongoDB does not currently have historical records stored for ${selectedSymbol}. Click below to fetch real data from Yahoo Finance.`}
          actionText={`Fetch Data for ${selectedSymbol}`}
          onAction={handleManualFetch}
          loadingAction={fetchingData}
        />
      )}
    </div>
  );
};
