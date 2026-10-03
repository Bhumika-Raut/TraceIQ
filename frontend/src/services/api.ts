import { OverviewData, EntityDetail, GraphData, RiskSignalSummary } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchOverview(): Promise<OverviewData> {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error('Failed to load dashboard overview data');
  return res.json();
}

export async function fetchEntities(riskLevel?: string, type?: string): Promise<EntityDetail[]> {
  const params = new URLSearchParams();
  if (riskLevel && riskLevel !== 'ALL') params.append('risk_level', riskLevel);
  if (type && type !== 'ALL') params.append('type', type);
  
  const res = await fetch(`${API_BASE}/entities?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch entities list');
  return res.json();
}

export async function fetchEntityDetail(entityId: string): Promise<EntityDetail> {
  const res = await fetch(`${API_BASE}/entities/${encodeURIComponent(entityId)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Entity "${entityId}" not found`);
    }
    throw new Error(`Failed to fetch details for entity "${entityId}"`);
  }
  return res.json();
}

export async function fetchGraph(maxNodes: number = 60, riskLevel: string = 'all'): Promise<GraphData> {
  const params = new URLSearchParams({
    max_nodes: maxNodes.toString(),
    risk_level: riskLevel,
  });
  const res = await fetch(`${API_BASE}/graph?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load relationship graph');
  return res.json();
}

export async function searchEntities(query: string): Promise<EntityDetail[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search request failed');
  return res.json();
}

export async function fetchRiskSignals(): Promise<RiskSignalSummary[]> {
  const res = await fetch(`${API_BASE}/risk-signals`);
  if (!res.ok) throw new Error('Failed to fetch risk signals summary');
  return res.json();
}
