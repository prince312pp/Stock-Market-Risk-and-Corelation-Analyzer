import React from 'react';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Calculating statistical parameters...',
}) => (
  <div className="p-8 space-y-4">
    <div className="flex items-center space-x-3 text-xs font-medium text-blue-400">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
      <span>{message}</span>
    </div>

    {/* Calm Skeleton geometry */}
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#111827] border border-[#293548] animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-[#111827] border border-[#293548] animate-pulse" />
    </div>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  loadingAction?: boolean;
}> = ({ title, description, actionText, onAction, loadingAction }) => (
  <div className="bg-[#111827] border border-[#293548] rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3.5 max-w-xl mx-auto shadow-sm">
    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm">
      <Database className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-[#F3F6FC] tracking-tight">{title}</h3>
    <p className="text-xs text-[#A8B3C7] leading-relaxed max-w-md">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        disabled={loadingAction}
        className="mt-2 inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
        <span>{loadingAction ? 'Fetching...' : actionText}</span>
      </button>
    )}
  </div>
);

export const ErrorAlert: React.FC<{ message: string; onDismiss?: () => void }> = ({
  message,
  onDismiss,
}) => (
  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 flex items-start justify-between space-x-3 text-xs mb-6">
    <div className="flex items-start space-x-2.5">
      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
      <div>
        <strong className="font-semibold block text-rose-200">Data or Calculation Notice</strong>
        <span className="leading-relaxed">{message}</span>
      </div>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="text-rose-400 hover:text-rose-200 font-bold ml-2 text-base leading-none p-1"
        aria-label="Dismiss Alert"
      >
        &times;
      </button>
    )}
  </div>
);
