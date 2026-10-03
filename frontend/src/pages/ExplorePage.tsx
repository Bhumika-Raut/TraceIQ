import React, { useState } from 'react';
import { GraphData, EntityDetail } from '../types';
import { GraphView } from '../components/GraphView';
import { InvestigationPanel } from '../components/InvestigationPanel';
import { Network, X } from 'lucide-react';

interface ExplorePageProps {
  graphData: GraphData;
  selectedEntity: EntityDetail | null;
  onSelectEntity: (entityId: string) => void;
  riskFilter: string;
  setRiskFilter: (filter: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  graphData,
  selectedEntity,
  onSelectEntity,
  riskFilter,
  setRiskFilter,
}) => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Network className="w-6 h-6 text-purple-400" />
            <span>Interactive Relationship Graph</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zoom, drag, and select nodes to explore hidden device sharing, shared IP networks, and account clusters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Full-width interactive canvas graph */}
        <div className={selectedEntity ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <GraphView
            data={graphData}
            onSelectNode={onSelectEntity}
            selectedNodeId={selectedEntity?.entity_id}
            riskFilter={riskFilter}
            setRiskFilter={setRiskFilter}
          />
        </div>

        {/* Side Investigation Drawer when node selected */}
        {selectedEntity && (
          <div className="lg:col-span-1">
            <InvestigationPanel
              entity={selectedEntity}
              onClose={() => onSelectEntity('')}
              onSelectConnectedEntity={onSelectEntity}
            />
          </div>
        )}

      </div>
    </div>
  );
};
