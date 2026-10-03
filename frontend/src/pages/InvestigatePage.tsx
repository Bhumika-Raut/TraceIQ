import React, { useState } from 'react';
import { EntityDetail } from '../types';
import { InvestigationPanel } from '../components/InvestigationPanel';
import { ShieldAlert, Search, ChevronRight, AlertCircle } from 'lucide-react';

interface InvestigatePageProps {
  allEntities: EntityDetail[];
  selectedEntity: EntityDetail | null;
  onSelectEntity: (entityId: string) => void;
}

export const InvestigatePage: React.FC<InvestigatePageProps> = ({
  allEntities,
  selectedEntity,
  onSelectEntity,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filtered = allEntities.filter(e => 
    e.entity_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <ShieldAlert className="w-6 h-6 text-purple-400" />
          <span>Deep Entity Investigator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect granular explainable risk reasons, score impacts, connected devices/IPs, and transaction histories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Entity Selector Sidebar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-md shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter entities..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1 divide-y divide-slate-800/40">
            {filtered.map(e => {
              const isSelected = selectedEntity?.entity_id === e.entity_id;
              return (
                <div
                  key={e.entity_id}
                  onClick={() => onSelectEntity(e.entity_id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-900/40 border border-purple-600 text-white shadow-md'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono">{e.entity_id}</span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded ${
                        e.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        e.risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {e.risk_level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{e.name}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-2">
          <InvestigationPanel
            entity={selectedEntity}
            onSelectConnectedEntity={onSelectEntity}
          />
        </div>

      </div>
    </div>
  );
};
