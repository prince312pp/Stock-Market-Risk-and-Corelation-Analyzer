import React from 'react';

interface DateRangeSelectorProps {
  startDate?: string;
  endDate?: string;
  onRangeChange: (start?: string, end?: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onRangeChange,
}) => {
  const handlePreset = (months: number | null) => {
    if (months === null) {
      onRangeChange(undefined, undefined);
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];
    onRangeChange(startStr, endStr);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase text-[#8794AA] tracking-wide mr-1">
        Period:
      </span>

      {/* Recessed Pill Segmented Control */}
      <div className="neu-inset rounded-xl p-1 inline-flex items-center space-x-1 text-xs">
        {[
          { label: '1M', months: 1 },
          { label: '3M', months: 3 },
          { label: '6M', months: 6 },
          { label: '1Y', months: 12 },
          { label: 'All', months: null },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => handlePreset(item.months)}
            className="px-2.5 py-1 rounded-lg text-[#A8B3C7] hover:text-[#F3F6FC] font-medium transition-all text-xs"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-1.5 text-xs text-[#8794AA]">
        <input
          type="date"
          value={startDate || ''}
          onChange={(e) => onRangeChange(e.target.value || undefined, endDate)}
          className="neu-inset rounded-lg px-2.5 py-1 text-[#F3F6FC] text-xs font-mono focus:outline-none"
        />
        <span>to</span>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => onRangeChange(startDate, e.target.value || undefined)}
          className="neu-inset rounded-lg px-2.5 py-1 text-[#F3F6FC] text-xs font-mono focus:outline-none"
        />
      </div>
    </div>
  );
};
