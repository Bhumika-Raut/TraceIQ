from typing import Dict, List, Set, Any
import pandas as pd
from app.models.schemas import GraphData, GraphNode, GraphLink
from app.services.risk_engine import RiskEngine

class GraphService:
    def __init__(self, dataset: Dict[str, pd.DataFrame], risk_engine: RiskEngine):
        self.tx_df = dataset["transactions"]
        self.users_df = dataset["users"]
        self.risk_engine = risk_engine

    def build_graph(self, max_nodes: int = 60, risk_filter: str = "all") -> GraphData:
        df = self.tx_df.copy()
        
        # Determine subset of entities to keep graph clean and readable
        all_entities = self.risk_engine.get_all_entities_analysis()
        
        if risk_filter.upper() in ["HIGH", "MEDIUM", "LOW"]:
            filtered = [e for e in all_entities if e.risk_level.upper() == risk_filter.upper()]
        else:
            filtered = all_entities

        # Prioritize higher risk entities for the interactive graph view
        top_entities = sorted(filtered, key=lambda x: x.risk_score, reverse=True)[:max_nodes]
        target_entity_ids = set(e.entity_id for e in top_entities)

        nodes_dict: Dict[str, GraphNode] = {}
        links_set: Set[tuple] = set()

        def add_node(entity_id: str, label: str, etype: str):
            if entity_id not in nodes_dict:
                analysis = self.risk_engine.analyze_entity(entity_id)
                nodes_dict[entity_id] = GraphNode(
                    id=entity_id,
                    label=label,
                    type=etype,
                    risk_score=analysis.risk_score,
                    risk_level=analysis.risk_level,
                    group=etype
                )

        # Include relationship edges from transaction records
        for _, row in df.iterrows():
            u_id = row["user_id"]
            u_name = row["user_name"]
            a_id = row["account_id"]
            d_id = row["device_id"]
            ip_id = row["ip_address"]
            m_id = row["merchant_id"]
            m_name = row["merchant_name"]

            # Connect if either side is in target_entity_ids
            connected_targets = {u_id, a_id, d_id, ip_id, m_id}
            if connected_targets.intersection(target_entity_ids):
                add_node(u_id, u_name, "user")
                add_node(a_id, a_id, "account")
                add_node(d_id, d_id, "device")
                add_node(ip_id, ip_id, "ip")
                add_node(m_id, m_name, "merchant")

                # Links
                links_set.add((u_id, a_id, "OWNS_ACCOUNT"))
                links_set.add((u_id, d_id, "USES_DEVICE"))
                links_set.add((u_id, ip_id, "USES_IP"))
                links_set.add((a_id, d_id, "TRANSACTS_VIA_DEVICE"))
                links_set.add((u_id, m_id, "TRANSACTS_WITH"))

        links_list = [
            GraphLink(source=src, target=tgt, relationship=rel)
            for (src, tgt, rel) in links_set
            if src in nodes_dict and tgt in nodes_dict
        ]

        return GraphData(
            nodes=list(nodes_dict.values()),
            links=links_list
        )
