import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const RegulatoryBanner: React.FC = () => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-1 text-xs text-slate-200 transition-all select-none">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-wide">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <strong className="text-emerald-400">DEMO MODE</strong>
          <span className="text-slate-400">| Checks use example data only</span>
        </span>
        <button
          onClick={() => setMinimized(false)}
          className="ml-3 text-slate-400 transition hover:text-white"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-200 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/20">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="text-[12px] leading-relaxed">
            <span className="mr-2 font-semibold tracking-wider text-emerald-400 font-mono">
              DEMO APP — EXAMPLE DATA ONLY
            </span>
            <span className="text-slate-300">
              Checks are simulated. No real medicine orders or government filings are made.
            </span>
          </div>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          title="Minimize banner"
        >
          <span className="hidden text-[11px] sm:inline">Hide</span>
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
