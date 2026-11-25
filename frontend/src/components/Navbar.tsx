import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, RefreshCw } from 'lucide-react';
import { fetchHealth, fetchMarketData, fetchStocks } from '../services/api';
import type { BackendHealth } from '../types';

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);

  const checkStatus = () => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth({
        status: 'unreachable',
        database_connected: false,
        database_engine: 'MongoDB',
        latest_market_data_date: null,
        fixed_stocks_count: 10,
      }));
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
      setFetchMsg(`Fetched ${res.total_records_stored} records successfully.`);
      checkStatus();
    } catch (err: any) {
      setFetchMsg(`Fetch error: ${err.message}`);
    } finally {
      setFetching(false);
      setTimeout(() => setFetchMsg(null), 5000);
    }
  };

  return (
    <nav className="bg-[#111827] border-b border-[#293548] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-[#F3F6FC] tracking-tight">
                Stock Market Risk &amp; Correlation Analyzer
              </div>
              <div className="text-xs text-[#A8B3C7]">
                NSE Universe &bull; Yahoo Finance &bull; MongoDB
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-[#A8B3C7] hover:text-[#F3F6FC] hover:bg-[#182235]'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/stock-analysis"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-[#A8B3C7] hover:text-[#F3F6FC] hover:bg-[#182235]'
                }`
              }
            >
              Stock Analysis
            </NavLink>
            <NavLink
              to="/correlation"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-[#A8B3C7] hover:text-[#F3F6FC] hover:bg-[#182235]'
                }`
              }
            >
              Correlation Analysis
            </NavLink>
            <NavLink
              to="/portfolio"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-[#A8B3C7] hover:text-[#F3F6FC] hover:bg-[#182235]'
                }`
              }
            >
              Portfolio Calculator
            </NavLink>
          </div>

          {/* Right Status / Sync */}
          <div className="flex items-center space-x-3">
            {health && (
              <div className="hidden lg:flex items-center space-x-2 text-xs bg-[#182235] px-3 py-1.5 rounded-full border border-[#293548]">
                <div
                  className={`w-2 h-2 rounded-full ${
                    health.database_connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                  }`}
                />
                <span className="text-[#A8B3C7]">MongoDB:</span>
                <span className={health.database_connected ? 'text-emerald-300 font-medium' : 'text-red-300'}>
                  {health.database_connected ? 'Connected' : 'Offline'}
                </span>
                {health.latest_market_data_date && (
                  <>
                    <span className="text-[#475569]">&bull;</span>
                    <span className="text-[#A8B3C7]">Latest:</span>
                    <span className="text-[#F3F6FC]">{health.latest_market_data_date}</span>
                  </>
                )}
              </div>
            )}

            <button
              onClick={handleFetchAll}
              disabled={fetching}
              title="Sync latest market data from Yahoo Finance into MongoDB"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#182235] hover:bg-[#202c44] text-blue-300 border border-[#293548] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin text-blue-400' : ''}`} />
              <span>{fetching ? 'Fetching...' : 'Sync Market Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fetch message notification banner */}
      {fetchMsg && (
        <div className="bg-[#182235] border-t border-[#293548] px-4 py-2 text-xs text-center text-[#F3F6FC]">
          {fetchMsg}
        </div>
      )}
    </nav>
  );
};
