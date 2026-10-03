from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class RiskSignalItem(BaseModel):
    signal_name: str
    score_impact: int
    explanation: str

class RiskAnalysis(BaseModel):
    entity_id: str
    entity_type: str  # user, account, device, ip, merchant
    risk_score: int
    risk_level: str   # HIGH, MEDIUM, LOW
    risk_signals: List[RiskSignalItem]

class ConnectedEntities(BaseModel):
    users: List[str] = []
    accounts: List[str] = []
    devices: List[str] = []
    ip_addresses: List[str] = []

class TransactionItem(BaseModel):
    transaction_id: str
    user_id: str
    account_id: str
    device_id: str
    ip_address: str
    merchant_id: str
    merchant_name: str
    amount: float
    timestamp: str
    location: str
    payment_method: str

class EntityDetail(BaseModel):
    entity_id: str
    entity_type: str
    name: str
    risk_score: int
    risk_level: str
    risk_signals: List[RiskSignalItem]
    connected_entities: ConnectedEntities
    transaction_count: int
    total_amount: float
    transactions: List[TransactionItem] = []

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # user, account, device, ip, merchant
    risk_score: int
    risk_level: str
    group: Optional[str] = None

class GraphLink(BaseModel):
    source: str
    target: str
    relationship: str

class GraphData(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]

class OverviewResponse(BaseModel):
    total_users: int
    total_accounts: int
    total_transactions: int
    total_devices: int
    total_ips: int
    risk_signals_count: int
    risk_distribution: Dict[str, int]  # {"HIGH": x, "MEDIUM": y, "LOW": z}
    top_risk_entities: List[EntityDetail]

class RiskSignalSummary(BaseModel):
    name: str
    category: str
    weight: int
    triggered_count: int
    description: str
