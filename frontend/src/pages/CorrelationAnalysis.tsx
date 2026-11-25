import React, { useEffect, useState } from 'react';
import { GitCommit, AlertTriangle, Table, Grid3X3, ArrowRightLeft } from 'lucide-react';
import { fetchStocks, fetchCorrelation } from '../services/api';
import type { StockMetadata, CorrelationResponse } from '../types';
import { PageHeader } from '../components/PageHeader';
import { StockSelector } from '../components/StockSelector';
import { FormulaCard } from '../components/FormulaCard';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/StatusStates';

export const CorrelationAnalysis: React.FC = () => {
  const [stocks, setStocks] = useState<StockMetadata[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Focused two-stock comparison state
  const [focusStockA, setFocusStockA] = useState<string>('SOLARINDS.NS');
  const [focusStockB, setFocusStockB] = useState<string>('BAJFINANCE.NS');
  const [activeTab, setActiveTab] = useState<'heatmap' | 'covariance'>('heatmap');

  useEffect(() => {
    fetchStocks()
      .then((stockList) => {
        setStocks(stockList);
        if (stockList.length >= 2) {
          setFocusStockA(stockList[0].symbol);
          setFocusStockB(stockList[1].symbol);
        }
        return fetchCorrelation();
      })
      .then(setCorrelationData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const symbols = correlationData?.symbols || [];
  const corrMatrix = correlationData?.correlation_matrix || {};
  const covMatrix = correlationData?.covariance_matrix || {};

  // Compute Diverging Color for Pearson Correlation in [-1.0, +1.0]
  const getCellColor = (val: number | null | undefined, isDiagonal: boolean) => {
    if (val === undefined || val === null || isNaN(val)) {
      return 'bg-[#182235]/40 text-[#8794AA]';
    }
    if (isDiagonal) {
      // Subdued diagonal per DESIGN.md Section 10
      return 'bg-[#182235] text-[#8794AA] font-medium border border-[#293548]/40';
    }
    if (val > 0.7) {
      return 'bg-blue-600/35 text-blue-200 font-bold border border-blue-500/30';
    }
    if (val > 0.4) {
      return 'bg-emerald-600/25 text-emerald-200 font-semibold';
    }
    if (val > 0.15) {
      return 'bg-emerald-600/15 text-emerald-300';
    }
    if (val > -0.15) {
      return 'bg-[#182235]/70 text-[#A8B3C7]';
    }
    if (val > -0.4) {
      return 'bg-rose-600/15 text-rose-300';
    }
    if (val > -0.7) {
      return 'bg-rose-600/25 text-rose-200 font-semibold';
    }
    return 'bg-rose-600/40 text-rose-100 font-bold border border-rose-500/30';
  };

  // Get focused pair details
  const focusedCorr =
    corrMatrix[focusStockA]?.[focusStockB] ??
    corrMatrix[focusStockB]?.[focusStockA] ??
    null;
  const focusedCov =
    covMatrix[focusStockA]?.[focusStockB] ??
    covMatrix[focusStockB]?.[focusStockA] ??
    null;
  const focusedInterpretation =
    correlationData?.interpretation[`${focusStockA}__${focusStockB}`] ||
    correlationData?.interpretation[`${focusStockB}__${focusStockA}`] ||
    (focusedCorr !== null
      ? `A correlation coefficient of ${focusedCorr.toFixed(4)} indicates ${
          focusedCorr > 0.5
            ? 'strong positive co-movement'
            : focusedCorr > 0.2
            ? 'moderate positive co-movement'
            : focusedCorr > -0.2
            ? 'low linear correlation, providing notable diversification benefits'
            : 'negative co-movement, where assets tend to move inversely'
        } across the aligned 245 sessions.`
      : `Insufficient historical data available for ${focusStockA} or ${focusStockB}.`);

  const handleSwapFocus = () => {
    const temp = focusStockA;
    setFocusStockA(focusStockB);
    setFocusStockB(temp);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <PageHeader
        title="Stock Correlation &amp; Covariance Matrix"
        subtitle="Examine Pearson correlation coefficients and sample covariance across the fixed NSE stock universe on synchronized trading days."
        badge="Multi-Asset Statistics"
      />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Data Synchronization Banner */}
      <div className="neu-inset rounded-xl p-3.5 text-xs text-[#A8B3C7] flex items-center space-x-2.5">
        <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-[#F3F6FC]">Data Synchronization:</strong> All 10 approved historically strong-performing NSE equities share{' '}
          <strong className="text-blue-400 font-mono">{correlationData?.sample_size ?? 245} synchronized trading sessions</strong>{' '}
          ({correlationData?.common_date_range.start} to {correlationData?.common_date_range.end}) with 100% complete pairwise observation coverage.
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating sample covariance and Pearson correlation on aligned trading sessions..." />
      ) : correlationData && symbols.length > 0 ? (
        <div className="space-y-8">
          {/* Focused Pair Investigation Card */}
          <div className="neu-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#293548] gap-3">
              <div>
                <h2 className="text-base font-bold text-[#F3F6FC] flex items-center space-x-2">
                  <GitCommit className="w-4 h-4 text-blue-400" />
                  <span>Focused Pair Investigation</span>
                </h2>
                <p className="text-xs text-[#8794AA] mt-0.5">
                  Select two stocks to inspect their pairwise co-movement, degrees of freedom, and plain-language statistical meaning.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSwapFocus}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#182235] hover:bg-[#202c44] text-[#A8B3C7] hover:text-[#F3F6FC] border border-[#293548] transition-colors focus:outline-none"
                  title="Swap Stock 1 and Stock 2"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Swap</span>
                </button>

                <div className="text-xs text-[#A8B3C7] neu-inset px-3 py-1.5 rounded-lg">
                  Aligned Sessions: <strong className="text-[#F3F6FC] font-mono">{correlationData.sample_size}</strong>
                </div>
              </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <StockSelector
                label="Stock 1 (X)"
                stocks={stocks}
                selectedSymbol={focusStockA}
                onSelect={(sym) => setFocusStockA(sym)}
                disabledSymbol={focusStockB}
              />
              <StockSelector
                label="Stock 2 (Y)"
                stocks={stocks}
                selectedSymbol={focusStockB}
                onSelect={(sym) => setFocusStockB(sym)}
                disabledSymbol={focusStockA}
              />
            </div>

            {/* Focused Pair Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="neu-raised p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8794AA]">
                    Pearson Correlation (ρ)
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-bold mt-1.5 tabular-nums ${
                      focusedCorr === null
                        ? 'text-[#8794AA]'
                        : focusedCorr > 0.5
                        ? 'text-emerald-400'
                        : focusedCorr < -0.2
                        ? 'text-rose-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {focusedCorr !== null ? focusedCorr.toFixed(4) : 'N/A'}
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-[#8794AA] neu-inset px-2 py-1 rounded">
                  Scale: [-1.0, +1.0] (Dimensionless)
                </div>
              </div>

              <div className="neu-raised p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8794AA]">
                    Sample Covariance (ddof = 1)
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono mt-1.5 tabular-nums">
                    {focusedCov !== null ? focusedCov.toFixed(8) : 'N/A'}
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-[#8794AA] neu-inset px-2 py-1 rounded font-mono">
                  Cov(X, Y) on n = {correlationData.sample_size}
                </div>
              </div>

              <div className="neu-raised p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8794AA]">
                    Statistical Co-Movement
                  </div>
                  <p className="text-xs text-[#F3F6FC] mt-1.5 leading-relaxed">
                    {focusedInterpretation}
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-[#8794AA] italic">
                  Note: Correlation reflects linear co-movement, not causal linkage or forward forecast.
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="neu-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#293548] gap-3">
              {/* Segmented Tab Switcher */}
              <div className="neu-inset p-1 rounded-xl inline-flex space-x-1">
                <button
                  onClick={() => setActiveTab('heatmap')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                    activeTab === 'heatmap'
                      ? 'bg-[#182235] text-blue-400 shadow-sm border border-blue-500/30'
                      : 'text-[#8794AA] hover:text-[#F3F6FC]'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span>Pearson Correlation Heatmap (10×10)</span>
                </button>
                <button
                  onClick={() => setActiveTab('covariance')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                    activeTab === 'covariance'
                      ? 'bg-[#182235] text-blue-400 shadow-sm border border-blue-500/30'
                      : 'text-[#8794AA] hover:text-[#F3F6FC]'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Sample Covariance Matrix (ddof = 1)</span>
                </button>
              </div>

              {/* Heatmap Legend */}
              {activeTab === 'heatmap' ? (
                <div className="flex items-center space-x-2 text-[11px] text-[#8794AA]">
                  <span>Legend:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-600/30 text-rose-200 font-mono text-[10px]">
                    -1.0 (Inverse)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#182235] text-[#A8B3C7] font-mono text-[10px]">
                    0.0 (Uncorrelated)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-200 font-mono text-[10px]">
                    +1.0 (Direct)
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-[#8794AA] font-mono">
                  Units: Return² (Daily Variance on Aligned Days)
                </div>
              )}
            </div>

            {/* Matrix Table with Deliberate Horizontal Scroll */}
            <div className="overflow-x-auto rounded-xl border border-[#293548]/60">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-[#182235] text-[#8794AA] border-b border-[#293548]">
                    <th className="p-3 text-left font-semibold uppercase text-[10px] tracking-wider w-24">
                      Symbol
                    </th>
                    {symbols.map((sym) => (
                      <th
                        key={sym}
                        className={`p-2.5 font-mono text-[11px] font-semibold ${
                          sym === focusStockA || sym === focusStockB
                            ? 'text-blue-300 bg-blue-500/10'
                            : ''
                        }`}
                      >
                        {sym.replace('.NS', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293548]/40 bg-[#111827]">
                  {symbols.map((rowSym) => (
                    <tr key={rowSym} className="hover:bg-[#182235]/40 transition-colors">
                      <td
                        className={`p-2.5 text-left font-bold text-[#F3F6FC] whitespace-nowrap bg-[#182235]/60 border-r border-[#293548]/40 ${
                          rowSym === focusStockA || rowSym === focusStockB
                            ? 'text-blue-300'
                            : ''
                        }`}
                      >
                        {rowSym.replace('.NS', '')}
                      </td>
                      {symbols.map((colSym) => {
                        const isDiagonal = rowSym === colSym;
                        const val =
                          activeTab === 'heatmap'
                            ? corrMatrix[rowSym]?.[colSym]
                            : covMatrix[rowSym]?.[colSym];
                        const isSelectedPair =
                          (rowSym === focusStockA && colSym === focusStockB) ||
                          (rowSym === focusStockB && colSym === focusStockA);

                        return (
                          <td
                            key={colSym}
                            onClick={() => {
                              if (!isDiagonal && val !== null && val !== undefined) {
                                setFocusStockA(rowSym);
                                setFocusStockB(colSym);
                              }
                            }}
                            title={`Pair: ${rowSym} & ${colSym} (${
                              val !== null && val !== undefined ? val : 'N/A'
                            })`}
                            className={`p-2.5 font-mono tabular-nums transition-all ${
                              !isDiagonal && val !== null && val !== undefined
                                ? 'cursor-pointer hover:ring-1 hover:ring-blue-400'
                                : 'cursor-default'
                            } ${
                              isSelectedPair ? 'ring-2 ring-blue-400 z-10 relative font-bold' : ''
                            } ${
                              activeTab === 'heatmap'
                                ? getCellColor(val, isDiagonal)
                                : isDiagonal
                                ? 'bg-[#182235]/70 text-blue-300 font-semibold'
                                : 'bg-[#111827] text-amber-200/90'
                            }`}
                          >
                            {val !== undefined && val !== null
                              ? activeTab === 'heatmap'
                                ? val.toFixed(2)
                                : val.toFixed(6)
                              : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-[#8794AA] pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span>Click any off-diagonal cell with active data to set that pair as the focused investigation above.</span>
              <span className="font-mono text-[11px] text-[#A8B3C7]">Aligned Trading Days: {correlationData.sample_size}</span>
            </div>
          </div>

          {/* Academic Formula Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormulaCard
              title="Sample Covariance Formula"
              formula="Cov(X, Y) = Σ(X_i - X̄)(Y_i - Ȳ) / (n - 1)"
              description="Calculates the directional co-movement of two asset return series. Bessel's correction divides by (n - 1) to produce an unbiased sample estimate."
              inputs={{
                'Aligned Sessions (n)': correlationData.sample_size,
                'Degrees of Freedom': correlationData.sample_size - 1,
                'Focused Pair': `${focusStockA.replace('.NS', '')} & ${focusStockB.replace('.NS', '')}`,
              }}
              academicNote="Covariance preserves the units of returns squared. It is positive when assets tend to move together and negative when they move in opposite directions."
            />
            <FormulaCard
              title="Pearson Correlation Coefficient"
              formula="ρ_{X,Y} = Cov(X, Y) / (s_X × s_Y)"
              description="Standardizes sample covariance by dividing by the product of individual sample standard deviations, yielding a scale-free metric bounded between -1.0 and +1.0."
              inputs={{
                'Focused Pair': `${focusStockA.replace('.NS', '')} & ${focusStockB.replace('.NS', '')}`,
                'Sample Covariance': focusedCov !== null ? focusedCov.toFixed(8) : 'N/A',
                'Correlation (ρ)': focusedCorr !== null ? focusedCorr.toFixed(4) : 'N/A',
              }}
              academicNote="Near +1 indicates strong co-movement; near 0 indicates linear independence, which unlocks the mathematical risk-reduction benefits of portfolio diversification."
            />
          </div>
        </div>
      ) : (
        <EmptyState
          title="Insufficient Data to Compute Correlation"
          description="At least two stocks with overlapping historical trading sessions in MongoDB are needed to compute correlation and covariance matrices."
        />
      )}
    </div>
  );
};
