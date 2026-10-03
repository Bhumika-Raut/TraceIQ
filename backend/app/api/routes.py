from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import (
    OverviewResponse, EntityDetail, RiskAnalysis, GraphData, 
    RiskSignalSummary
)
from app.services.data_generator import generate_synthetic_dataset
from app.services.risk_engine import RiskEngine
from app.services.graph_service import GraphService

router = APIRouter()

# Initialize data and services globally
dataset = generate_synthetic_dataset()
risk_engine = RiskEngine(dataset)
graph_service = GraphService(dataset, risk_engine)

@router.get("/health")
def health_check():
    return {"status": "ok", "app": "TraceIQ API", "version": "1.0.0"}

@router.get("/overview", response_model=OverviewResponse)
def get_overview():
    df = dataset["transactions"]
    all_entities = risk_engine.get_all_entities_analysis()
    
    high_cnt = sum(1 for e in all_entities if e.risk_level == "HIGH")
    med_cnt = sum(1 for e in all_entities if e.risk_level == "MEDIUM")
    low_cnt = sum(1 for e in all_entities if e.risk_level == "LOW")

    total_signals = sum(len(e.risk_signals) for e in all_entities)
    top_risks = [e for e in all_entities if e.risk_score > 0][:8]

    return OverviewResponse(
        total_users=len(dataset["users"]),
        total_accounts=len(dataset["accounts"]),
        total_transactions=len(df),
        total_devices=int(df["device_id"].nunique()),
        total_ips=int(df["ip_address"].nunique()),
        risk_signals_count=total_signals,
        risk_distribution={"HIGH": high_cnt, "MEDIUM": med_cnt, "LOW": low_cnt},
        top_risk_entities=top_risks
    )

@router.get("/entities", response_model=List[EntityDetail])
def get_entities(
    risk_level: Optional[str] = Query(None, description="Filter by HIGH, MEDIUM, LOW"),
    type: Optional[str] = Query(None, description="Filter by user, account, device, ip, merchant")
):
    entities = risk_engine.get_all_entities_analysis()
    
    if risk_level:
        entities = [e for e in entities if e.risk_level.upper() == risk_level.upper()]
    
    if type:
        entities = [e for e in entities if e.entity_type.lower() == type.lower()]

    return entities

@router.get("/entities/{entity_id}", response_model=EntityDetail)
def get_entity_detail(entity_id: str):
    all_entities = risk_engine.get_all_entities_analysis()
    match = next((e for e in all_entities if e.entity_id.lower() == entity_id.lower()), None)
    if not match:
        # Check if entity exists in transactions
        match = risk_engine.analyze_entity(entity_id)
        if match.transaction_count == 0 and match.entity_type == "unknown":
            raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found.")
    return match

@router.get("/risk/{entity_id}", response_model=RiskAnalysis)
def get_entity_risk(entity_id: str):
    detail = risk_engine.analyze_entity(entity_id)
    return RiskAnalysis(
        entity_id=detail.entity_id,
        entity_type=detail.entity_type,
        risk_score=detail.risk_score,
        risk_level=detail.risk_level,
        risk_signals=detail.risk_signals
    )

@router.get("/graph", response_model=GraphData)
def get_graph(
    max_nodes: int = Query(60, ge=10, le=200),
    risk_level: str = Query("all")
):
    return graph_service.build_graph(max_nodes=max_nodes, risk_filter=risk_level)

@router.get("/search", response_model=List[EntityDetail])
def search_entities(q: str = Query("", description="Query string for entity ID or name")):
    q_clean = q.strip().lower()
    if not q_clean:
        return []
    
    all_entities = risk_engine.get_all_entities_analysis()
    results = []

    for e in all_entities:
        if (q_clean in e.entity_id.lower() or 
            q_clean in e.name.lower() or 
            q_clean in e.entity_type.lower()):
            results.append(e)

    # Search in transactions if query starts with TX
    if q_clean.startswith("tx-"):
        tx_match = dataset["transactions"][dataset["transactions"]["transaction_id"].str.lower() == q_clean]
        if not tx_match.empty:
            tx_entity = risk_engine.analyze_entity(tx_match.iloc[0]["transaction_id"])
            results.append(tx_entity)

    return results

@router.get("/risk-signals", response_model=List[RiskSignalSummary])
def get_risk_signals():
    all_entities = risk_engine.get_all_entities_analysis()
    
    signal_counts = {
        "Shared Device": 0,
        "Shared IP Address": 0,
        "High Transaction Velocity": 0,
        "Unusually High Amount": 0,
        "Many Connected Accounts": 0
    }

    for e in all_entities:
        for sig in e.risk_signals:
            name = sig.signal_name
            if name in signal_counts:
                signal_counts[name] += 1
            elif "Shared IP" in name:
                signal_counts["Shared IP Address"] += 1

    return [
        RiskSignalSummary(
            name="Shared Device",
            category="Device Intelligence",
            weight=25,
            triggered_count=signal_counts["Shared Device"],
            description="Triggered when multiple distinct user profiles transact using the same physical device ID."
        ),
        RiskSignalSummary(
            name="Shared IP Address",
            category="Network Intelligence",
            weight=20,
            triggered_count=signal_counts["Shared IP Address"],
            description="Triggered when an IP address routes traffic for multiple distinct accounts or users."
        ),
        RiskSignalSummary(
            name="High Transaction Velocity",
            category="Behavioral Analytics",
            weight=20,
            triggered_count=signal_counts["High Transaction Velocity"],
            description="Triggered when an entity exhibits abnormal rapid transaction frequencies."
        ),
        RiskSignalSummary(
            name="Unusually High Amount",
            category="Financial Anomaly",
            weight=20,
            triggered_count=signal_counts["Unusually High Amount"],
            description="Triggered when transaction amounts exceed the 90th percentile baseline threshold."
        ),
        RiskSignalSummary(
            name="Many Connected Accounts",
            category="Account Graph",
            weight=15,
            triggered_count=signal_counts["Many Connected Accounts"],
            description="Triggered when an entity controls or connects to multiple distinct bank accounts."
        ),
    ]
