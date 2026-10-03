import React from 'react';
import { OverviewData, RiskSignalSummary } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, Zap, Layers } from 'lucide-react';

interface RiskOverviewProps {
  overview: OverviewData;
  riskSignals: RiskSignalSummary[];
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({ overview, riskSignals }) => {
  const { HIGH, MEDIUM, LOW } = overview.risk_distribution;
  const totalEntities = HIGH + MEDIUM + LOW || 1;

  const highPct = Math.round((HIGH / totalEntities) * 100);
  const medPct = Math.round((MEDIUM / totalEntities) * 100);
  const lowPct = Math.round((LOW / totalEntities) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Risk Level Distribution Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Risk Level Distribution</span>
          </h3>
          <span className="text-xs text-slate-400">{totalEntities} Total Entities</span>
        </div>

        {/* Multi-segment distribution progress bar */}
        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex mb-6 shadow-inner">
          <div style={{ width: `${highPct}%` }} className="bg-red-500 transition-all duration-500" title={`High Risk: ${HIGH}`} />
          <div style={{ width: `${medPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Medium Risk: ${MEDIUM}`} />
          <div style={{ width: `${lowPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Low Risk: ${LOW}`} />
        </div>

        {/* Breakdown Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/20 border border-red-900/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-slate-200">High Risk (Score ≥ 70)</span>
            </div>
            <span className="text-sm font-extrabold text-red-400">{HIGH} ({highPct}%)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-900/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-slate-200">Medium Risk (Score 30-69)</span>
            </div>
            <span className="text-sm font-extrabold text-amber-400">{MEDIUM} ({medPct}%)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-200">Low Risk (Score &lt; 30)</span>
            </div>
            <span className="text-sm font-extrabold text-emerald-400">{LOW} ({lowPct}%)</span>
          </div>
        </div>
      </div>

      {/* Top Active Risk Signals List */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Active Risk Signals Engine</span>
          </h3>
          <span className="text-xs text-slate-400">Rule-based Weighting</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {riskSignals.map((sig, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-800/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100">{sig.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/40 rounded">
                  +{sig.weight} PTS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">{sig.description}</p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium text-slate-500 border-t border-slate-800/60 pt-2">
                <span>Category: {sig.category}</span>
                <span className="text-purple-400 font-bold">{sig.triggered_count} Triggered</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
