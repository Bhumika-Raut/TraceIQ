import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  colorTheme?: 'purple' | 'blue' | 'amber' | 'emerald' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = 'purple',
}) => {
  const themeStyles = {
    purple: 'from-purple-900/20 to-purple-950/30 border-purple-800/40 text-purple-400 icon-bg-purple-900/40',
    blue: 'from-blue-900/20 to-blue-950/30 border-blue-800/40 text-blue-400 icon-bg-blue-900/40',
    amber: 'from-amber-900/20 to-amber-950/30 border-amber-800/40 text-amber-400 icon-bg-amber-900/40',
    emerald: 'from-emerald-900/20 to-emerald-950/30 border-emerald-800/40 text-emerald-400 icon-bg-emerald-900/40',
    red: 'from-red-900/20 to-red-950/30 border-red-800/40 text-red-400 icon-bg-red-900/40',
  }[colorTheme];

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${themeStyles} backdrop-blur-md shadow-lg transition-all hover:border-slate-600/60`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg bg-slate-900/70 border border-slate-700/50`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>}
    </div>
  );
};
