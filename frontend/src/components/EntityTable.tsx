import React from 'react';
import { EntityDetail, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import { ChevronRight, ArrowUpDown, Filter } from 'lucide-react';

interface EntityTableProps {
  entities: EntityDetail[];
  onSelectEntity: (entityId: string) => void;
  selectedEntityId?: string;
}

export const EntityTable: React.FC<EntityTableProps> = ({
  entities,
  onSelectEntity,
  selectedEntityId,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3.5 pl-5">Entity</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">Risk Score</th>
              <th className="p-3.5">Risk Signals</th>
              <th className="p-3.5">Connected Entities</th>
              <th className="p-3.5">Volume</th>
              <th className="p-3.5 text-right pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {entities.map(e => {
              const isSelected = e.entity_id === selectedEntityId;
              const connectedCount = 
                e.connected_entities.users.length +
                e.connected_entities.accounts.length +
                e.connected_entities.devices.length +
                e.connected_entities.ip_addresses.length;

              return (
                <tr
                  key={e.entity_id}
                  onClick={() => onSelectEntity(e.entity_id)}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'bg-purple-950/40 border-l-4 border-l-purple-500' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-slate-100">{e.entity_id}</div>
                    <div className="text-[11px] text-slate-400">{e.name}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                      e.entity_type === 'user' ? 'bg-purple-900/40 text-purple-300 border border-purple-700/40' :
                      e.entity_type === 'account' ? 'bg-blue-900/40 text-blue-300 border border-blue-700/40' :
                      e.entity_type === 'device' ? 'bg-amber-900/40 text-amber-300 border border-amber-700/40' :
                      e.entity_type === 'ip' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {e.entity_type}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <RiskBadge score={e.risk_score} level={e.risk_level} size="sm" />
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {e.risk_signals.length > 0 ? (
                        e.risk_signals.map((sig, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 text-[10px] bg-slate-950 text-slate-300 border border-slate-800 rounded"
                          >
                            {sig.signal_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-300">
                    {connectedCount} nodes
                  </td>
                  <td className="p-3.5 font-semibold text-slate-200">
                    ${e.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <button className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white font-semibold text-xs transition-colors flex items-center space-x-1 ml-auto">
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
