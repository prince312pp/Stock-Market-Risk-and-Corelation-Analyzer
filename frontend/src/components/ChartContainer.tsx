import React from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  explanation?: string;
  actionSlot?: React.ReactNode;
  children: React.ReactNode;
  height?: number | string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  explanation,
  actionSlot,
  children,
  height = 340,
}) => {
  return (
    <div className="bg-[#111827] border border-[#293548] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#293548]/60 mb-5 gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#F3F6FC] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#8794AA] mt-0.5">{subtitle}</p>}
          </div>
          {actionSlot && <div className="flex items-center space-x-2 shrink-0">{actionSlot}</div>}
        </div>

        <div style={{ width: '100%', height }} className="relative">
          {children}
        </div>
      </div>

      {explanation && (
        <div className="mt-5 pt-3.5 border-t border-[#293548]/60 text-xs text-[#8794AA] leading-relaxed">
          {explanation}
        </div>
      )}
    </div>
  );
};
