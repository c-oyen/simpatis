import React from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface RoleActionBannerProps {
  onNavigateTab?: (tab: string) => void;
}

export const RoleActionBanner: React.FC<RoleActionBannerProps> = () => {
  const { 
    isSyncingWithSheets,
    saveStatusMessage
  } = useApp();

  // The static banner card has been removed per user request.
  // We only display a subtle floating notification toast when an active sync/save operation occurs.
  if (!saveStatusMessage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900/95 backdrop-blur-xs text-white px-4 py-3 rounded-xl shadow-2xl border border-stone-700 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center gap-2.5">
        {isSyncingWithSheets ? (
          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="font-semibold text-stone-100">{saveStatusMessage}</span>
      </div>
    </div>
  );
};

