import React, { useState } from 'react';
import { OverviewData, EntityDetail, GraphData, RiskSignalSummary } from '../types';
import { MetricCard } from '../components/MetricCard';
import { RiskOverview } from '../components/RiskOverview';
import { EntityTable } from '../components/EntityTable';
import { GraphView } from '../components/GraphView';
import { Users, CreditCard, Activity, Smartphone, ShieldAlert, ArrowRight, Filter } from 'lucide-react';

interface OverviewPageProps {
  overview: OverviewData;
  graphData: GraphData;
  riskSignals: RiskSignalSummary[];
  allEntities: EntityDetail[];
  onSelectEntity: (entityId: string) => void;
  onNavigateToGraph: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  overview,
  graphData,
  riskSignals,
  allEntities,
  onSelectEntity,
  onNavigateToGraph,
}) => {
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEntities = allEntities.filter(e => {
    const matchRisk = filterRiskLevel === 'ALL' || e.risk_level === filterRiskLevel;
    const matchType = filterType === 'ALL' || e.entity_type === filterType.toLowerCase();
    return matchRisk && matchType;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Entity Risk Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time relationship intelligence & automated explainable risk scores.
          </p>
        </div>
        <button
          onClick={onNavigateToGraph}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <span>Explore Full Graph</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          title="Total Users"
          value={overview.total_users}
          subtitle="Monitored customer profiles"
          icon={Users}
          colorTheme="purple"
        />
        <MetricCard
          title="Total Accounts"
          value={overview.total_accounts}
          subtitle="Linked bank accounts"
          icon={CreditCard}
          colorTheme="blue"
        />
        <MetricCard
          title="Transactions"
          value={overview.total_transactions}
          subtitle="Processed events"
          icon={Activity}
          colorTheme="emerald"
        />
        <MetricCard
          title="Connected Devices"
          value={overview.total_devices}
          subtitle="Registered hardware IDs"
          icon={Smartphone}
          colorTheme="amber"
        />
        <MetricCard
          title="Risk Signals"
          value={overview.risk_signals_count}
          subtitle="Triggered safety rules"
          icon={ShieldAlert}
          colorTheme="red"
        />
      </div>

      {/* Risk Overview Breakdown */}
      <RiskOverview overview={overview} riskSignals={riskSignals} />

      {/* Graph Visual Centerpiece Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Entity Relationship Graph</h2>
            <p className="text-xs text-slate-400">Interactive topology map highlighting interconnected risk clusters.</p>
          </div>
        </div>
        <GraphView
          data={graphData}
          onSelectNode={onSelectEntity}
          riskFilter="all"
          setRiskFilter={() => {}}
        />
      </div>

      {/* Entity Intelligence Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Entity Intelligence Directory</h2>
            <p className="text-xs text-slate-400">Select any entity to launch an investigation.</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <span className="text-slate-400 font-medium mr-1">Risk:</span>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterRiskLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${
                    filterRiskLevel === lvl
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="user">Users</option>
              <option value="account">Accounts</option>
              <option value="device">Devices</option>
              <option value="ip">IP Addresses</option>
            </select>
          </div>
        </div>

        {/* Entity Table */}
        <EntityTable
          entities={filteredEntities}
          onSelectEntity={onSelectEntity}
        />
      </div>

    </div>
  );
};
