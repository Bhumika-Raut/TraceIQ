export type EntityType = 'user' | 'account' | 'device' | 'ip' | 'merchant' | 'transaction' | 'unknown';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskSignalItem {
  signal_name: string;
  score_impact: number;
  explanation: string;
}

export interface ConnectedEntities {
  users: string[];
  accounts: string[];
  devices: string[];
  ip_addresses: string[];
}

export interface TransactionItem {
  transaction_id: string;
  user_id: string;
  account_id: string;
  device_id: string;
  ip_address: string;
  merchant_id: string;
  merchant_name: string;
  amount: number;
  timestamp: string;
  location: string;
  payment_method: string;
}

export interface EntityDetail {
  entity_id: string;
  entity_type: EntityType;
  name: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_signals: RiskSignalItem[];
  connected_entities: ConnectedEntities;
  transaction_count: number;
  total_amount: number;
  transactions: TransactionItem[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  risk_score: number;
  risk_level: RiskLevel;
  group?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface OverviewData {
  total_users: number;
  total_accounts: number;
  total_transactions: number;
  total_devices: number;
  total_ips: number;
  risk_signals_count: number;
  risk_distribution: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  top_risk_entities: EntityDetail[];
}

export interface RiskSignalSummary {
  name: string;
  category: string;
  weight: number;
  triggered_count: number;
  description: string;
}
