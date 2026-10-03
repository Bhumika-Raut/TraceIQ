import React from 'react';
import { EntityDetail } from '../types';
import { RiskBadge } from './RiskBadge';
import { ShieldAlert, Users, CreditCard, Smartphone, Globe, AlertTriangle, ArrowRight, DollarSign, Clock, MapPin, X } from 'lucide-react';

interface InvestigationPanelProps {
  entity: EntityDetail | null;
  onClose?: () => void;
  onSelectConnectedEntity: (entityId: string) => void;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  entity,
  onClose,
  onSelectConnectedEntity,
}) => {
  if (!entity) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
        <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">No Entity Selected</p>
        <p className="text-xs text-slate-500 mt-1">Select any node on the graph or search an entity to open the investigation panel.</p>
      </div>
    );
  }

  const { connected_entities } = entity;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 text-slate-200">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-purple-900/50 text-purple-300 border border-purple-700/50">
              {entity.entity_type}
            </span>
            <span className="text-xs text-slate-400">ID: {entity.entity_id}</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">{entity.name}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <RiskBadge score={entity.risk_score} level={entity.risk_level} size="lg" />
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Risk Signals Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Explainable Risk Signals ({entity.risk_signals.length})</span>
        </h3>

        {entity.risk_signals.length > 0 ? (
          <div className="space-y-2.5">
            {entity.risk_signals.map((sig, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between space-x-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-100">{sig.signal_name}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-950/50 border border-red-800/40 rounded">
                      +{sig.score_impact} PTS
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sig.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 italic">
            No active suspicious risk signals detected for this entity.
          </div>
        )}
      </div>

      {/* Connected Entities Breakdown */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Connected Entities Graph
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          
          {/* Connected Users */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
            <div className="flex items-center justify-between text-purple-400 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5" />
                <span>Users</span>
              </span>
              <span className="font-extrabold">{connected_entities.users.length}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {connected_entities.users.slice(0, 4).map(u => (
                <button
                  key={u}
                  onClick={() => onSelectConnectedEntity(u)}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 rounded border border-purple-700/40 transition-colors"
                >
                  {u}
                </button>
              ))}
              {connected_entities.users.length > 4 && (
                <span className="text-[10px] text-purple-400 font-bold self-center">+{connected_entities.users.length - 4} more</span>
              )}
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Accounts</span>
              </span>
              <span className="font-extrabold">{connected_entities.accounts.length}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {connected_entities.accounts.slice(0, 4).map(a => (
                <button
                  key={a}
                  onClick={() => onSelectConnectedEntity(a)}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 rounded border border-blue-700/40 transition-colors"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Devices */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30">
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Devices</span>
              </span>
              <span className="font-extrabold">{connected_entities.devices.length}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {connected_entities.devices.slice(0, 4).map(d => (
                <button
                  key={d}
                  onClick={() => onSelectConnectedEntity(d)}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 rounded border border-amber-700/40 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Connected IPs */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>IP Addresses</span>
              </span>
              <span className="font-extrabold">{connected_entities.ip_addresses.length}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {connected_entities.ip_addresses.slice(0, 3).map(ip => (
                <button
                  key={ip}
                  onClick={() => onSelectConnectedEntity(ip)}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 rounded border border-emerald-700/40 transition-colors"
                >
                  {ip}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Transaction Activity Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Transaction Activity ({entity.transaction_count})
          </h3>
          <span className="text-xs font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
            Total Vol: ${entity.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {entity.transactions.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="p-2.5">TX ID</th>
                  <th className="p-2.5">Merchant</th>
                  <th className="p-2.5">Amount</th>
                  <th className="p-2.5">Method</th>
                  <th className="p-2.5">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {entity.transactions.map(tx => (
                  <tr key={tx.transaction_id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2.5 font-mono text-purple-300 font-medium">{tx.transaction_id}</td>
                    <td className="p-2.5 text-slate-200">{tx.merchant_name}</td>
                    <td className="p-2.5 font-bold text-white">${tx.amount.toFixed(2)}</td>
                    <td className="p-2.5 text-[11px] text-slate-400">{tx.payment_method}</td>
                    <td className="p-2.5 text-[11px] text-slate-400">{tx.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/40 text-center text-xs text-slate-500">
            No transaction records found for this entity.
          </div>
        )}
      </div>

    </div>
  );
};
