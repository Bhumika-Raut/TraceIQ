import React from 'react';
import { RiskLevel } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  score: number;
  level?: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  level,
  showIcon = true,
  size = 'md',
}) => {
  const calcLevel: RiskLevel = level || (score >= 70 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW');

  const config = {
    HIGH: {
      bg: 'bg-red-500/15 border-red-500/40 text-red-400',
      icon: ShieldAlert,
      label: 'HIGH RISK',
    },
    MEDIUM: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      icon: AlertTriangle,
      label: 'MEDIUM RISK',
    },
    LOW: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      icon: CheckCircle2,
      label: 'LOW RISK',
    },
  }[calcLevel];

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] space-x-1',
    md: 'px-2.5 py-1 text-xs space-x-1.5',
    lg: 'px-3 py-1.5 text-sm space-x-2 font-bold',
  }[size];

  return (
    <div className={`inline-flex items-center rounded-lg border font-semibold tracking-wide ${config.bg} ${sizeClasses}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{score} / 100</span>
      <span className="opacity-75 font-normal">({config.label})</span>
    </div>
  );
};
