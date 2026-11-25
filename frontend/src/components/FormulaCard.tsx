import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface FormulaCardProps {
  title: string;
  formula: string;
  description: string;
  inputs?: Record<string, string | number>;
  substitution?: string;
  result?: string;
  academicNote?: string;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  title,
  formula,
  description,
  inputs,
  substitution,
  result,
  academicNote,
}) => {
  return (
    <div className="neu-card p-5 space-y-3.5">
      <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span>{title}</span>
      </div>

      {/* Recessed Formula Well */}
      <div className="neu-inset rounded-xl p-3 text-center">
        <span className="font-mono text-sm sm:text-base text-blue-300 font-semibold tracking-wide">
          {formula}
        </span>
      </div>

      <p className="text-xs text-[#A8B3C7] leading-relaxed">{description}</p>

      {/* Inputs Breakdown */}
      {inputs && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
          {Object.entries(inputs).map(([k, v]) => (
            <div key={k} className="neu-inset px-2.5 py-1.5 rounded-lg">
              <span className="text-[#8794AA] block text-[10px] uppercase font-mono tracking-tight">{k}</span>
              <span className="text-[#F3F6FC] font-mono font-medium tabular-nums">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Numerical Substitution */}
      {substitution && (
        <div className="neu-inset p-3 rounded-xl text-xs space-y-1">
          <div className="text-[10px] text-[#8794AA] uppercase font-semibold tracking-wider">
            Substituted Calculation:
          </div>
          <div className="font-mono text-amber-300/90 break-all text-[11px] sm:text-xs">
            {substitution}
          </div>
          {result && (
            <div className="font-mono text-emerald-400 font-semibold pt-1 border-t border-[#293548]/60 flex items-center space-x-1 tabular-nums">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>= {result}</span>
            </div>
          )}
        </div>
      )}

      {academicNote && (
        <div className="text-[11px] text-[#A8B3C7] italic bg-[#182235]/40 p-2.5 rounded-lg border-l-2 border-blue-400/80 leading-relaxed">
          <strong className="text-[#F3F6FC] not-italic">Academic Principle:</strong> {academicNote}
        </div>
      )}
    </div>
  );
};
