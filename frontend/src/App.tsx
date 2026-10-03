import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { ExplorePage } from './pages/ExplorePage';
import { InvestigatePage } from './pages/InvestigatePage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { OverviewData, EntityDetail, GraphData, RiskSignalSummary } from './types';
import { fetchOverview, fetchGraph, fetchRiskSignals, fetchEntities, fetchEntityDetail } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'explore' | 'investigate'>('overview');
  
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [riskSignals, setRiskSignals] = useState<RiskSignalSummary[]>([]);
  const [allEntities, setAllEntities] = useState<EntityDetail[]>([]);
  
  const [selectedEntityId, setSelectedEntityId] = useState<string>('USER-001');
  const [selectedEntity, setSelectedEntity] = useState<EntityDetail | null>(null);
  
  const [graphRiskFilter, setGraphRiskFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load core application data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovData, gData, sigsData, entData] = await Promise.all([
        fetchOverview(),
        fetchGraph(60, graphRiskFilter),
        fetchRiskSignals(),
        fetchEntities(),
      ]);

      setOverview(ovData);
      setGraphData(gData);
      setRiskSignals(sigsData);
      setAllEntities(entData);

      // Default select top risk entity if available
      const defaultId = entData.length > 0 ? entData[0].entity_id : 'USER-001';
      setSelectedEntityId(defaultId);
      const detail = await fetchEntityDetail(defaultId);
      setSelectedEntity(detail);
    } catch (err: any) {
      console.error("Failed to load TraceIQ data:", err);
      setError(err.message || "Failed to communicate with backend service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update graph when risk filter changes
  useEffect(() => {
    if (!overview) return;
    fetchGraph(60, graphRiskFilter)
      .then(gData => setGraphData(gData))
      .catch(err => console.error("Graph filter fetch error:", err));
  }, [graphRiskFilter]);

  // Handle selecting an entity for investigation
  const handleSelectEntity = async (entityId: string) => {
    if (!entityId) {
      setSelectedEntityId('');
      setSelectedEntity(null);
      return;
    }
    setSelectedEntityId(entityId);
    try {
      const detail = await fetchEntityDetail(entityId);
      setSelectedEntity(detail);
    } catch (err: any) {
      console.error(`Failed to fetch detail for ${entityId}:`, err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectEntity={handleSelectEntity}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* API Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-800/80 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3 text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold">Backend Connection Error:</span> {error}
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Initializing TraceIQ Entity Intelligence Graph..." />
        ) : overview && graphData ? (
          <>
            {activeTab === 'overview' && (
              <OverviewPage
                overview={overview}
                graphData={graphData}
                riskSignals={riskSignals}
                allEntities={allEntities}
                onSelectEntity={(id) => {
                  handleSelectEntity(id);
                  setActiveTab('investigate');
                }}
                onNavigateToGraph={() => setActiveTab('explore')}
              />
            )}

            {activeTab === 'explore' && (
              <ExplorePage
                graphData={graphData}
                selectedEntity={selectedEntity}
                onSelectEntity={handleSelectEntity}
                riskFilter={graphRiskFilter}
                setRiskFilter={setGraphRiskFilter}
              />
            )}

            {activeTab === 'investigate' && (
              <InvestigatePage
                allEntities={allEntities}
                selectedEntity={selectedEntity}
                onSelectEntity={handleSelectEntity}
              />
            )}
          </>
        ) : null}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-slate-950/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 TraceIQ — Entity Relationship & Risk Intelligence Platform</p>
          <p className="text-[11px] text-slate-600">Built for Bureau Data Engineering Internship Portfolio</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
