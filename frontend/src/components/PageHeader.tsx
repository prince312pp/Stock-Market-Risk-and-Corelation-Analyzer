import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  actionSlot?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actionSlot,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-[#293548] mb-8 gap-4">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F6FC] tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-[#A8B3C7] leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      </div>

      {actionSlot && (
        <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-auto">
          {actionSlot}
        </div>
      )}
    </div>
  );
};
