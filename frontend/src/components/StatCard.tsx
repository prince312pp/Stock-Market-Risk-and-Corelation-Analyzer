import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  formulaNote?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'positive' | 'negative' | 'accent' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  formulaNote,
  icon,
  variant = 'default',
}) => {
  const valueColorMap = {
    default: 'text-[#F3F6FC]',
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    accent: 'text-blue-400',
    warning: 'text-amber-400',
  };

  return (
    <div className="neu-raised rounded-2xl p-5 flex flex-col justify-between transition-all duration-200">
      <div>
        <div className="flex items-center justify-between text-xs font-medium text-[#8794AA] mb-2">
          <span className="tracking-wide uppercase text-[11px]">{title}</span>
          {icon && <span className="text-[#8794AA] p-1 rounded-md bg-[#182235]/60">{icon}</span>}
        </div>

        <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${valueColorMap[variant]}`}>
          {value}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {subtext && <div className="text-xs text-[#A8B3C7] leading-tight">{subtext}</div>}

        {formulaNote && (
          <div className="neu-inset px-2.5 py-1 rounded-md text-[11px] font-mono text-blue-300/90 break-words">
            {formulaNote}
          </div>
        )}
      </div>
    </div>
  );
};
