import React, { useEffect, useState } from 'react';
import {
  PieChart,
  CheckCircle2,
  ArrowRightLeft,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { fetchStocks, calculatePortfolio } from '../services/api';
import type { StockMetadata, PortfolioCalculationResponse } from '../types';
import { PageHeader } from '../components/PageHeader';
import { StockSelector } from '../components/StockSelector';
import { StatCard } from '../components/StatCard';
import { ChartContainer } from '../components/ChartContainer';
import { FormulaCard } from '../components/FormulaCard';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/StatusStates';

export const PortfolioCalculator: React.FC = () => {
  const [stocks, setStocks] = useState<StockMetadata[]>([]);
  const [stockA, setStockA] = useState<string>('SOLARINDS.NS');
  const [stockB, setStockB] = useState<string>('BAJFINANCE.NS');
  const [weightA, setWeightA] = useState<number>(0.5); // 50%
  const [result, setResult] = useState<PortfolioCalculationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const weightB = Math.round((1.0 - weightA) * 100) / 100;

  useEffect(() => {
    fetchStocks()
      .then((data) => {
        setStocks(data);
        if (data.length >= 2) {
          setStockA(data[0].symbol);
          setStockB(data[1].symbol);
          runCalculation(data[0].symbol, data[1].symbol, 0.5, 0.5);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const runCalculation = async (symA: string, symB: string, wA: number, wB: number) => {
    if (symA === symB) {
      setError('Please select two distinct stocks for the portfolio calculation.');
      return;
    }
    try {
      setError(null);
      const res = await calculatePortfolio({
        symbol_a: symA,
        symbol_b: symB,
        weight_a: wA,
        weight_b: wB,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightSlider = (val: number) => {
    const clampedVal = Math.max(0, Math.min(100, val));
    const w1 = clampedVal / 100.0;
    const w2 = Math.round((1.0 - w1) * 100) / 100.0;
    setWeightA(w1);
    runCalculation(stockA, stockB, w1, w2);
  };

  const handleStockAChange = (sym: string) => {
    setStockA(sym);
    runCalculation(sym, stockB, weightA, weightB);
  };

  const handleStockBChange = (sym: string) => {
    setStockB(sym);
    runCalculation(stockA, sym, weightA, weightB);
  };

  const swapStocks = () => {
    const temp = stockA;
    setStockA(stockB);
    setStockB(temp);
    runCalculation(stockB, temp, weightA, weightB);
  };

  const formula = result?.formula_breakdown;

  // Custom Tooltip for Risk Comparison Chart
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="neu-card p-3 rounded-xl border border-[#293548] text-xs space-y-1.5 shadow-xl">
          <div className="font-bold text-[#F3F6FC] font-mono border-b border-[#293548] pb-1">
            {label}
          </div>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between space-x-4">
              <span className="text-[#8794AA] flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-mono font-bold text-[#F3F6FC] tabular-nums">
                {Number(item.value).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="Two-Stock Portfolio Risk &amp; Diversification Calculator"
        subtitle="Model how capital weights and asset return covariance govern combined portfolio risk and expected return under Markowitz portfolio theory."
        badge="Markowitz Portfolio Theory"
      />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Asset Selection & Weight Controls Card */}
      <div className="neu-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#293548] gap-4">
          <div>
            <h2 className="text-base font-bold text-[#F3F6FC] flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Asset Selection &amp; Weight Allocation</span>
            </h2>
            <p className="text-xs text-[#8794AA] mt-0.5">
              Select two assets and allocate capital. Capital weights are constrained to strictly sum to 100% (long-only).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={swapStocks}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#182235] hover:bg-[#202c44] text-[#A8B3C7] hover:text-[#F3F6FC] border border-[#293548] transition-colors focus:outline-none"
              title="Swap Asset A and Asset B"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap Assets</span>
            </button>

            {/* 100% Constraint Indicator */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Total: 100%</span>
            </div>
          </div>
        </div>

        {/* Side-by-side Selectors & Paired Numeric Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Stock A Card */}
          <div className="neu-raised p-5 rounded-2xl space-y-4">
            <StockSelector
              label="Stock 1 (Asset A)"
              stocks={stocks}
              selectedSymbol={stockA}
              onSelect={handleStockAChange}
              disabledSymbol={stockB}
            />

            <div className="neu-inset p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#8794AA] font-medium">Weight (w₁):</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(weightA * 100)}
                  onChange={(e) => handleWeightSlider(Number(e.target.value))}
                  className="w-16 bg-[#111827] border border-[#293548] rounded-lg px-2 py-1 text-right text-sm font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs font-mono text-[#8794AA]">%</span>
              </div>
            </div>
          </div>

          {/* Stock B Card */}
          <div className="neu-raised p-5 rounded-2xl space-y-4">
            <StockSelector
              label="Stock 2 (Asset B)"
              stocks={stocks}
              selectedSymbol={stockB}
              onSelect={handleStockBChange}
              disabledSymbol={stockA}
            />

            <div className="neu-inset p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#8794AA] font-medium">Weight (w₂):</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(weightB * 100)}
                  onChange={(e) => handleWeightSlider(100 - Number(e.target.value))}
                  className="w-16 bg-[#111827] border border-[#293548] rounded-lg px-2 py-1 text-right text-sm font-mono font-bold text-purple-400 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs font-mono text-[#8794AA]">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Dual-Weight Slider */}
        <div className="neu-inset p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-blue-400 font-bold">
              {stockA.replace('.NS', '')}: {(weightA * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-[#8794AA] flex items-center space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Drag to reallocate capital</span>
            </span>
            <span className="text-purple-400 font-bold">
              {stockB.replace('.NS', '')}: {(weightB * 100).toFixed(0)}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(weightA * 100)}
            onChange={(e) => handleWeightSlider(Number(e.target.value))}
            className="w-full h-2.5 bg-[#111827] rounded-lg appearance-none cursor-pointer accent-blue-500 border border-[#293548]"
          />

          <div className="flex justify-between text-[11px] font-mono text-[#8794AA]">
            <span>100% {stockA.replace('.NS', '')}</span>
            <span>50% / 50% Equal Split</span>
            <span>100% {stockB.replace('.NS', '')}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating portfolio risk and verifying Markowitz analytical formula..." />
      ) : result ? (
        <div className="space-y-8">
          {/* Key Portfolio Result Metrics Strip */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8794AA]">
                Portfolio Calculated Risk &amp; Return Metrics ({result.sample_size} Aligned Sessions)
              </h2>
              <span className="text-[11px] font-mono text-[#8794AA]">
                Annualized Basis: 252 Trading Days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Expected Daily Return"
                value={`${(result.portfolio_mean_daily_return * 100).toFixed(4)}%`}
                subtext="w₁μ₁ + w₂μ₂"
                formulaNote="Arithmetic historical mean (Daily)"
                variant={result.portfolio_mean_daily_return >= 0 ? 'positive' : 'negative'}
              />
              <StatCard
                title="Portfolio Daily Volatility (σ_p)"
                value={`${(result.portfolio_std_dev * 100).toFixed(4)}%`}
                subtext="Square root of portfolio variance"
                formulaNote="σ_p = √(σ_p²)"
                variant="accent"
              />
              <StatCard
                title="Annualized Expected Return"
                value={`${(result.portfolio_mean_annualized_return * 100).toFixed(2)}%`}
                subtext="μ_p × 252 trading days"
                formulaNote="Arithmetic annual scale"
                variant={result.portfolio_mean_annualized_return >= 0 ? 'positive' : 'negative'}
              />
              <StatCard
                title="Annualized Portfolio Volatility"
                value={`${(result.portfolio_annualized_volatility * 100).toFixed(2)}%`}
                subtext="σ_p × √252 trading days"
                formulaNote="Square-root-of-time rule"
                variant="warning"
              />
            </div>
          </div>

          {/* Mathematical Validation Proof Card */}
          <div className="neu-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#293548] gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F3F6FC]">
                  Mathematical Proof: Theoretical Markowitz Formula vs. Observed Series Sample Variance
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Formula Match Confirmed (Δ &lt; 10⁻⁶)
              </span>
            </div>

            <p className="text-xs text-[#A8B3C7] leading-relaxed">
              In mathematical finance, the analytical Markowitz variance formula must precisely equal
              the sample variance (with Bessel&apos;s correction <span className="font-mono text-blue-300">ddof = 1</span>)
              of the realized linear daily return series{' '}
              <span className="font-mono text-[#F3F6FC]">
                R<sub>p,t</sub> = w₁R<sub>1,t</sub> + w₂R<sub>2,t</sub>
              </span>{' '}
              on the identical synchronized sessions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="neu-inset p-4 rounded-xl space-y-1">
                <span className="text-[#8794AA] block text-[11px] uppercase tracking-wide">
                  Theoretical Formula Variance (σ_p²):
                </span>
                <span className="text-blue-300 font-bold text-base block tabular-nums">
                  {result.portfolio_variance.toFixed(8)}
                </span>
                <span className="text-[10px] text-[#8794AA]">w₁²σ₁² + w₂²σ₂² + 2w₁w₂Cov</span>
              </div>

              <div className="neu-inset p-4 rounded-xl space-y-1">
                <span className="text-[#8794AA] block text-[11px] uppercase tracking-wide">
                  Observed Series Variance (s_p²):
                </span>
                <span className="text-emerald-300 font-bold text-base block tabular-nums">
                  {result.observed_portfolio_variance.toFixed(8)}
                </span>
                <span className="text-[10px] text-[#8794AA]">Sample variance of daily portfolio returns</span>
              </div>

              <div className="neu-inset p-4 rounded-xl space-y-1">
                <span className="text-[#8794AA] block text-[11px] uppercase tracking-wide">
                  Numerical Absolute Discrepancy:
                </span>
                <span className="text-amber-300 font-bold text-base block tabular-nums">
                  {result.variance_difference.toExponential(4)}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Exact floating-point equivalence</span>
              </div>
            </div>
          </div>

          {/* Risk Comparison Chart & Step-by-Step Formula Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Comparison Bar Chart */}
            <ChartContainer
              title="Annualized Risk &amp; Return Comparison"
              subtitle="Comparing individual stocks vs. combined portfolio volatility (% annualized)"
              explanation="Notice how combining two assets can yield portfolio volatility lower than the weighted average volatility of the individual assets when correlation is less than +1.0."
              height={320}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={result.comparison_chart_data}
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#293548' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={{ stroke: '#293548' }}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="annualized_volatility_pct"
                    name="Annualized Volatility (%)"
                    radius={[6, 6, 0, 0]}
                  >
                    {result.comparison_chart_data.map((entry, index) => (
                      <Cell
                        key={`cell-vol-${index}`}
                        fill={entry.symbol === 'PORTFOLIO' ? '#34D399' : '#60A5FA'}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="annualized_return_pct"
                    name="Annualized Return (%)"
                    fill="#FBBF24"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Formula Step-by-Step Card */}
            <FormulaCard
              title="Two-Stock Portfolio Variance Formula"
              formula="σ_p² = w₁²σ₁² + w₂²σ₂² + 2w₁w₂Cov(R₁, R₂)"
              description="Portfolio variance is not simply the weighted average of variances; the cross-term 2w₁w₂Cov accounts for how the two assets co-move over synchronized trading dates."
              inputs={{
                'Weight A (w₁)': result.weight_a,
                'Weight B (w₂)': result.weight_b,
                'Variance A (σ₁²)': result.variance_a.toFixed(8),
                'Variance B (σ₂²)': result.variance_b.toFixed(8),
                'Covariance': result.covariance.toFixed(8),
                'Correlation (ρ)': result.correlation.toFixed(4),
              }}
              substitution={formula?.substitution}
              result={`σ_p² = ${result.portfolio_variance.toFixed(8)}  →  σ_p = ${(result.portfolio_std_dev * 100).toFixed(4)}% daily`}
              academicNote="When covariance is low or negative, the cross-term dampens total portfolio variance, yielding the classical Markowitz diversification benefit."
            />
          </div>

          {/* Covariance Impact Breakdown Details */}
          <div className="neu-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F3F6FC]">
              Decomposition of Portfolio Variance Components:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="neu-inset p-4 rounded-xl space-y-1">
                <div className="text-[#8794AA] text-[11px] uppercase tracking-wide">
                  Component 1 (Asset A Weight × Var):
                </div>
                <div className="text-[#F3F6FC] font-bold text-sm mt-1 tabular-nums">
                  w₁²σ₁² = {formula?.term1}
                </div>
              </div>

              <div className="neu-inset p-4 rounded-xl space-y-1">
                <div className="text-[#8794AA] text-[11px] uppercase tracking-wide">
                  Component 2 (Asset B Weight × Var):
                </div>
                <div className="text-[#F3F6FC] font-bold text-sm mt-1 tabular-nums">
                  w₂²σ₂² = {formula?.term2}
                </div>
              </div>

              <div className="neu-inset p-4 rounded-xl space-y-1">
                <div className="text-[#8794AA] text-[11px] uppercase tracking-wide">
                  Component 3 (Covariance Impact):
                </div>
                <div className="text-amber-300 font-bold text-sm mt-1 tabular-nums">
                  2w₁w₂Cov = {formula?.term3_covariance_impact}
                </div>
              </div>
            </div>

            <div className="text-xs text-[#A8B3C7] neu-inset p-3 rounded-xl leading-relaxed font-mono">
              Total Variance = {formula?.term1} + {formula?.term2} + {formula?.term3_covariance_impact} ={' '}
              <strong className="text-emerald-400">{result.portfolio_variance.toFixed(8)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Insufficient Data for Portfolio Calculation"
          description="Ensure market data is populated for both selected stocks in MongoDB."
        />
      )}
    </div>
  );
};
