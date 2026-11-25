import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart2,
  GitCommit,
  PieChart,
  RefreshCw,
  Menu,
  X,
  Database,
  Calendar,
} from 'lucide-react';
import { fetchHealth, fetchMarketData, fetchStocks } from '../services/api';
import type { BackendHealth } from '../types';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const checkStatus = () => {
    fetchHealth()
      .then(setHealth)
      .catch(() =>
        setHealth({
          status: 'unreachable',
          database_connected: false,
          database_engine: 'MongoDB',
          latest_market_data_date: null,
          fixed_stocks_count: 10,
        })
      );
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleFetchAll = async () => {
    try {
      setFetching(true);
      setFetchMsg(null);
      const stocks = await fetchStocks();
      const res = await fetchMarketData(stocks.map((s) => s.symbol));
      setFetchMsg(`Synced ${res.total_records_stored} observations.`);
      checkStatus();
    } catch (err: any) {
      setFetchMsg(`Sync notice: ${err.message}`);
    } finally {
      setFetching(false);
      setTimeout(() => setFetchMsg(null), 5000);
    }
  };

  const navLinks = [
    {
      to: '/',
      label: 'Overview',
      icon: Activity,
      hint: 'Market snapshot & historical line chart',
    },
    {
      to: '/stock-analysis',
      label: 'Stock Analysis',
      icon: BarChart2,
      hint: 'OHLCV data, daily returns & variance',
    },
    {
      to: '/correlation',
      label: 'Correlation',
      icon: GitCommit,
      hint: '10×10 Pearson heatmap & covariance',
    },
    {
      to: '/portfolio',
      label: 'Portfolio Calculator',
      icon: PieChart,
      hint: 'Markowitz two-asset risk & validation',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F3F6FC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Mobile Top Navigation Bar (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#111827] border-b border-[#293548] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#F3F6FC] leading-none">Stock Risk Analyzer</div>
            <div className="text-[10px] text-[#A8B3C7] mt-0.5">NSE India &bull; Yahoo Finance</div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#182235] border border-[#293548] text-[#A8B3C7] hover:text-[#F3F6FC]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#040812]/80 backdrop-blur-sm flex flex-col"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85%] bg-[#111827] border-r border-[#293548] h-full p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#293548]">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-[#F3F6FC]">Stock Risk Analyzer</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#A8B3C7] hover:text-[#F3F6FC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold'
                            : 'text-[#A8B3C7] hover:text-[#F3F6FC] hover:bg-[#182235]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#293548] space-y-3 text-xs text-[#A8B3C7]">
              <div className="flex items-center justify-between">
                <span>MongoDB Status</span>
                <span className={health?.database_connected ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
                  {health?.database_connected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <button
                onClick={handleFetchAll}
                disabled={fetching}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
                <span>{fetching ? 'Syncing...' : 'Sync Market Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar (>= lg) */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#111827] border-r border-[#293548] z-30 select-none">
        {/* Brand Area */}
        <div className="p-6 pb-5 border-b border-[#293548]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-[#F3F6FC] tracking-tight">Stock Risk Analyzer</div>
              <div className="text-[11px] text-[#8794AA] font-medium">NSE India &bull; Yahoo Finance</div>
            </div>
          </div>
        </div>

        {/* Primary Navigation Items */}
        <div className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-[#8794AA]">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#182235] text-blue-400 font-semibold border border-[#293548] shadow-sm'
                      : 'text-[#A8B3C7] hover:text-[#F3F6FC] hover:bg-[#182235]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Accent Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-blue-400' : 'text-[#8794AA] group-hover:text-[#F3F6FC]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer — Status & Data Freshness */}
        <div className="p-4 border-t border-[#293548] bg-[#0D1422]/60 space-y-3">
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#8794AA] flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>MongoDB</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    health?.database_connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <span className={health?.database_connected ? 'text-emerald-300 font-medium' : 'text-rose-300'}>
                  {health?.database_connected ? 'Connected' : 'Offline'}
                </span>
              </span>
            </div>

            {health?.latest_market_data_date && (
              <div className="flex items-center justify-between text-[#8794AA]">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Latest Date</span>
                </span>
                <span className="text-[#F3F6FC] font-mono font-medium">{health.latest_market_data_date}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleFetchAll}
            disabled={fetching}
            className="w-full py-2 px-3 rounded-lg bg-[#182235] hover:bg-[#202c44] border border-[#293548] text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            title="Sync latest market data from Yahoo Finance into MongoDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
            <span>{fetching ? 'Syncing...' : 'Sync Market Data'}</span>
          </button>

          {fetchMsg && (
            <div className="p-2 rounded bg-[#182235] border border-[#293548] text-[10px] text-center text-[#F3F6FC] truncate">
              {fetchMsg}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#293548] bg-[#111827] py-6 text-xs text-[#8794AA]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-semibold text-[#F3F6FC]">Stock Market Risk &amp; Correlation Analyzer</p>
              <p className="text-[11px] text-[#8794AA] mt-0.5">
                Real historical NSE market data &bull; Bessel's correction (ddof=1) &bull; Markowitz portfolio variance
              </p>
            </div>
            <div className="text-[11px] text-[#64748b] max-w-md">
              <strong>Academic Disclaimer:</strong> Market data retrieved from Yahoo Finance via yfinance. Historical statistics describe past sample periods and do not constitute investment advice.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
