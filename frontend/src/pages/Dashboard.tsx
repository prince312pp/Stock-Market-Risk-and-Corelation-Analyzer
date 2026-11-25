import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BarChart2,
  GitCommit,
  PieChart,
  Calendar,
  ArrowRight,
  Database,
  Building,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { fetchStocks, fetchStockAnalysis, fetchHealth, fetchMarketData } from '../services/api';
import type { StockMetadata, StockAnalysisResponse, BackendHealth } from '../types';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { ChartContainer } from '../components/ChartContainer';
import { StockSelector } from '../components/StockSelector';
import { DateRangeSelector } from '../components/DateRangeSelector';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/StatusStates';

export const Dashboard: React.FC = () => {
  const [stocks, setStocks] = useState<StockMetadata[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SOLARINDS.NS');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<StockAnalysisResponse | null>(null);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => {});
    fetchStocks()
      .then((data) => {
        setStocks(data);
        if (data.length > 0) {
          loadStock(data[0].symbol, startDate, endDate);
        }
      })
      .catch((err) => {
        setError(`Failed to load stocks: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const loadStock = async (symbol: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSymbol(symbol);
      const res = await fetchStockAnalysis(symbol, start, end);
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (symbol: string) => {
    loadStock(symbol, startDate, endDate);
  };

  const handleDateChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
    loadStock(selectedSymbol, start, end);
  };

  const handleManualFetch = async () => {
    try {
      setFetchingData(true);
      setError(null);
      await fetchMarketData([selectedSymbol], startDate, endDate);
      await loadStock(selectedSymbol, startDate, endDate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetchingData(false);
    }
  };

  const chartData = (analysis?.prices || []).map((p) => ({
    date: p.date,
    price: p.adjusted_close || p.close,
    close: p.close,
    open: p.open,
    volume: p.volume,
  }));

  const selectedStockMeta = stocks.find((s) => s.symbol === selectedSymbol);
  const latestPriceRecord = analysis?.prices && analysis.prices.length > 0
    ? analysis.prices[analysis.prices.length - 1]
    : null;
  const latestReturnRecord = analysis?.returns_preview && analysis.returns_preview.length > 0
    ? analysis.returns_preview[analysis.returns_preview.length - 1]
    : null;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Page Header with Contextual Metadata */}
      <PageHeader
        title="Market Overview"
        subtitle="Explore historical performance, risk profiles, and co-movement across 10 approved NSE equities."
        badge="Live Analytical Environment"
        actionSlot={
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8794AA]">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#293548]">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yahoo Finance via yfinance</span>
            </div>
            {health?.latest_market_data_date && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#293548]">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Session: <strong className="text-[#F3F6FC] font-mono">{health.latest_market_data_date}</strong></span>
              </div>
            )}
          </div>
        }
      />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Control Row: Stock Selector + Date Range + Sync Action */}
      <div className="bg-[#111827] border border-[#293548] rounded-2xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-5">
          <StockSelector
            label="Active Instrument"
            stocks={stocks}
            selectedSymbol={selectedSymbol}
            onSelect={handleStockChange}
          />
        </div>

        <div className="lg:col-span-5">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onRangeChange={handleDateChange}
          />
        </div>

        <div className="lg:col-span-2 flex lg:justify-end">
          <button
            onClick={handleManualFetch}
            disabled={fetchingData}
            className="w-full lg:w-auto py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingData ? 'animate-spin' : ''}`} />
            <span>{fetchingData ? 'Fetching...' : 'Re-fetch Stock'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message={`Retrieving market data for ${selectedSymbol}...`} />
      ) : analysis && analysis.total_records > 0 ? (
        <div className="space-y-8">
          {/* Section 8.3: Primary Metric Strip (4 compact, evenly spaced metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Latest Price"
              value={`₹${latestPriceRecord ? (latestPriceRecord.adjusted_close || latestPriceRecord.close).toFixed(2) : '0.00'}`}
              subtext={latestPriceRecord ? `Adjusted Close on ${latestPriceRecord.date}` : 'Closing price'}
              icon={<Building className="w-4 h-4" />}
              variant="default"
            />

            <StatCard
              title="Latest Daily Return"
              value={
                latestReturnRecord
                  ? `${latestReturnRecord.return_pct >= 0 ? '+' : ''}${latestReturnRecord.return_pct.toFixed(2)}%`
                  : '0.00%'
              }
              subtext="Change from prior trading session"
              icon={<TrendingUp className="w-4 h-4" />}
              variant={
                latestReturnRecord
                  ? latestReturnRecord.return_pct >= 0
                    ? 'positive'
                    : 'negative'
                  : 'default'
              }
            />

            <StatCard
              title="Annualized Volatility"
              value={`${analysis.statistics?.annualized_volatility_pct.toFixed(2) ?? '0.00'}%`}
              subtext="Sample std dev × √252 days"
              formulaNote="σ_annual = s_daily × √252"
              variant="warning"
            />

            <StatCard
              title="Mean Daily Return"
              value={
                analysis.statistics
                  ? `${analysis.statistics.mean_daily_return_pct >= 0 ? '+' : ''}${analysis.statistics.mean_daily_return_pct.toFixed(4)}%`
                  : '0.0000%'
              }
              subtext={`Across ${analysis.statistics?.sample_size ?? 0} trading sessions`}
              formulaNote="R̄ = (1/n) Σ R_t"
              variant={(analysis.statistics?.mean_daily_return ?? 0) >= 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* Section 8.4: Main Historical Price Chart (The Visual Anchor) */}
          <ChartContainer
            title={`${selectedStockMeta?.company_name ?? selectedSymbol} — Historical Price Trajectory`}
            subtitle={`Adjusted Closing Price in INR (₹) &bull; Range: ${analysis.date_range.start} to ${analysis.date_range.end}`}
            explanation="Real historical daily observations from Yahoo Finance. Shaded gradient area illustrates price progression across trading sessions."
            height={360}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#293548" strokeOpacity={0.4} />
                <XAxis
                  dataKey="date"
                  stroke="#8794AA"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  stroke="#8794AA"
                  fontSize={11}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${val.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#293548',
                    borderRadius: '12px',
                    color: '#F3F6FC',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#60A5FA' }}
                  labelStyle={{ color: '#8794AA' }}
                  formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Adjusted Close']}
                  labelFormatter={(label) => `Trading Session: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                  activeDot={{ r: 5, fill: '#60A5FA', stroke: '#111827', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Section 8.5: Secondary Information & Feature Deep Dive Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              to="/stock-analysis"
              className="neu-card p-6 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F3F6FC] group-hover:text-blue-400 transition-colors">
                  Stock Analysis &amp; Math
                </h3>
                <p className="text-xs text-[#A8B3C7] leading-relaxed">
                  Inspect the complete OHLCV table, daily returns series, Bessel's sample variance (\(ddof=1\)),
                  and formula breakdowns with real substituted values.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#293548]/60 flex items-center text-xs font-semibold text-blue-400 space-x-1.5">
                <span>View Single Stock Drill-down</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/correlation"
              className="neu-card p-6 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GitCommit className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F3F6FC] group-hover:text-emerald-400 transition-colors">
                  Correlation &amp; Covariance
                </h3>
                <p className="text-xs text-[#A8B3C7] leading-relaxed">
                  View the 10×10 Pearson correlation heatmap and sample covariance matrix across aligned
                  trading days to understand cross-sector co-movements.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#293548]/60 flex items-center text-xs font-semibold text-emerald-400 space-x-1.5">
                <span>Inspect Correlation Matrix</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/portfolio"
              className="neu-card p-6 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F3F6FC] group-hover:text-purple-400 transition-colors">
                  Portfolio Risk Calculator
                </h3>
                <p className="text-xs text-[#A8B3C7] leading-relaxed">
                  Allocate weights between any two stocks. Observe Markowitz portfolio variance
                  decomposed into asset weights and covariance cross-terms.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#293548]/60 flex items-center text-xs font-semibold text-purple-400 space-x-1.5">
                <span>Calculate Two-Asset Portfolio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <EmptyState
          title={`No market data stored for ${selectedSymbol}`}
          description="Historical price records have not been retrieved from Yahoo Finance for this stock. Click below to fetch real market data into MongoDB."
          actionText={`Fetch Data for ${selectedSymbol}`}
          onAction={handleManualFetch}
          loadingAction={fetchingData}
        />
      )}
    </div>
  );
};
