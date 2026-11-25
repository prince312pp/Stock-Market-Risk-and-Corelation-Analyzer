import React from 'react';
import type { StockMetadata } from '../types';

interface StockSelectorProps {
  stocks: StockMetadata[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  label?: string;
  disabledSymbol?: string;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  selectedSymbol,
  onSelect,
  label,
  disabledSymbol,
}) => {
  const currentStock = stocks.find((s) => s.symbol === selectedSymbol);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#8794AA] tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={selectedSymbol}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full neu-inset text-[#F3F6FC] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
        >
          {stocks.map((stock) => (
            <option
              key={stock.symbol}
              value={stock.symbol}
              disabled={stock.symbol === disabledSymbol}
              className="bg-[#111827] text-[#F3F6FC]"
            >
              {stock.company_name} ({stock.symbol}) &bull; {stock.sector}
            </option>
          ))}
        </select>
      </div>

      {currentStock && (
        <div className="flex items-center space-x-2 text-[11px] text-[#8794AA] px-1 pt-0.5">
          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium">
            {currentStock.sector}
          </span>
          <span>{currentStock.exchange} Listed</span>
        </div>
      )}
    </div>
  );
};
