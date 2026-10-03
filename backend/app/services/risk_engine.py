import pandas as pd
import numpy as np
from typing import Dict, List, Any
from app.models.schemas import RiskAnalysis, RiskSignalItem, ConnectedEntities, EntityDetail, TransactionItem

class RiskEngine:
    def __init__(self, dataset: Dict[str, pd.DataFrame]):
        self.tx_df = dataset["transactions"]
        self.users_df = dataset["users"]
        self.accounts_df = dataset["accounts"]
        self.merchants_df = dataset["merchants"]
        
        # Calculate baseline stats
        self.amount_95th = self.tx_df["amount"].quantile(0.90) if not self.tx_df.empty else 1000.0
        
        # Precompute mappings & counts
        self._precompute_relationships()

    def _precompute_relationships(self):
        df = self.tx_df
        
        # Device -> Users mapping
        self.device_users = df.groupby("device_id")["user_id"].nunique().to_dict()
        self.device_user_list = df.groupby("device_id")["user_id"].unique().to_dict()
        
        # IP -> Accounts mapping
        self.ip_accounts = df.groupby("ip_address")["account_id"].nunique().to_dict()
        self.ip_account_list = df.groupby("ip_address")["account_id"].unique().to_dict()
        self.ip_users = df.groupby("ip_address")["user_id"].nunique().to_dict()

        # User -> Accounts mapping
        self.user_accounts = df.groupby("user_id")["account_id"].nunique().to_dict()
        self.user_account_list = df.groupby("user_id")["account_id"].unique().to_dict()

        # User -> Devices mapping
        self.user_devices = df.groupby("user_id")["device_id"].unique().to_dict()
        
        # User -> IPs mapping
        self.user_ips = df.groupby("user_id")["ip_address"].unique().to_dict()

        # Account -> Devices mapping
        self.account_devices = df.groupby("account_id")["device_id"].unique().to_dict()
        
        # Account -> Users mapping
        self.account_users = df.groupby("account_id")["user_id"].unique().to_dict()

        # Account -> IPs mapping
        self.account_ips = df.groupby("account_id")["ip_address"].unique().to_dict()

        # Velocity check: tx count in dataset for user/account/device/ip
        self.user_tx_counts = df.groupby("user_id")["transaction_id"].count().to_dict()
        self.device_tx_counts = df.groupby("device_id")["transaction_id"].count().to_dict()
        self.ip_tx_counts = df.groupby("ip_address")["transaction_id"].count().to_dict()

        # Max amount for entities
        self.user_max_amounts = df.groupby("user_id")["amount"].max().to_dict()
        self.device_max_amounts = df.groupby("device_id")["amount"].max().to_dict()
        self.ip_max_amounts = df.groupby("ip_address")["amount"].max().to_dict()
        self.account_max_amounts = df.groupby("account_id")["amount"].max().to_dict()

    def analyze_entity(self, entity_id: str) -> EntityDetail:
        df = self.tx_df
        entity_type = self._detect_entity_type(entity_id)

        signals: List[RiskSignalItem] = []
        raw_score = 0

        # Filter relevant transactions for this entity
        if entity_type == "user":
            subset = df[df["user_id"] == entity_id]
        elif entity_type == "account":
            subset = df[df["account_id"] == entity_id]
        elif entity_type == "device":
            subset = df[df["device_id"] == entity_id]
        elif entity_type == "ip":
            subset = df[df["ip_address"] == entity_id]
        elif entity_type == "merchant":
            subset = df[df["merchant_id"] == entity_id]
        elif entity_type == "transaction":
            subset = df[df["transaction_id"] == entity_id]
        else:
            subset = pd.DataFrame()

        # Extract connected entities
        connected_users = list(set(subset["user_id"].dropna().tolist())) if not subset.empty else []
        connected_accounts = list(set(subset["account_id"].dropna().tolist())) if not subset.empty else []
        connected_devices = list(set(subset["device_id"].dropna().tolist())) if not subset.empty else []
        connected_ips = list(set(subset["ip_address"].dropna().tolist())) if not subset.empty else []

        # Risk Rule 1: Shared Device (+25)
        # Triggered if entity uses a device used by > 1 user, or if entity IS a device used by > 1 user
        if entity_type == "device":
            u_cnt = self.device_users.get(entity_id, 0)
            if u_cnt > 1:
                raw_score += 25
                signals.append(RiskSignalItem(
                    signal_name="Shared Device",
                    score_impact=25,
                    explanation=f"Device shared across {u_cnt} distinct user profiles ({', '.join(self.device_user_list.get(entity_id, [])[:3])})."
                ))
        else:
            # Check devices connected to this user/account/IP
            shared_devs = [d for d in connected_devices if self.device_users.get(d, 0) > 1]
            if shared_devs:
                raw_score += 25
                signals.append(RiskSignalItem(
                    signal_name="Shared Device",
                    score_impact=25,
                    explanation=f"Associated with shared device(s) ({', '.join(shared_devs)}) linked to multiple users."
                ))

        # Risk Rule 2: Shared IP (+20)
        # Triggered if entity is connected to an IP shared across > 1 account/user
        if entity_type == "ip":
            a_cnt = self.ip_accounts.get(entity_id, 0)
            if a_cnt > 1:
                raw_score += 20
                signals.append(RiskSignalItem(
                    signal_name="Shared IP Address",
                    score_impact=20,
                    explanation=f"IP address used by {a_cnt} separate accounts across the network."
                ))
        else:
            shared_ips_list = [ip for ip in connected_ips if self.ip_accounts.get(ip, 0) > 1]
            if shared_ips_list:
                raw_score += 20
                signals.append(RiskSignalItem(
                    signal_name="Shared IP Address",
                    score_impact=20,
                    explanation=f"Transactions routed through shared IP address(es) ({', '.join(shared_ips_list)}) associated with multiple accounts."
                ))

        # Risk Rule 3: High Transaction Velocity (+20)
        # Triggered if entity has high count of transactions (> 10)
        tx_count = len(subset)
        if tx_count >= 15:
            raw_score += 20
            signals.append(RiskSignalItem(
                signal_name="High Transaction Velocity",
                score_impact=20,
                explanation=f"Rapid activity pattern with {tx_count} transactions recorded in a short timeframe."
            ))

        # Risk Rule 4: Unusually High Amount (+20)
        # Triggered if max transaction amount exceeds 90th percentile threshold
        max_amt = subset["amount"].max() if not subset.empty else 0.0
        if max_amt >= self.amount_95th:
            raw_score += 20
            signals.append(RiskSignalItem(
                signal_name="Unusually High Amount",
                score_impact=20,
                explanation=f"Max transaction amount (${max_amt:,.2f}) significantly exceeds dataset baseline (${self.amount_95th:,.2f})."
            ))

        # Risk Rule 5: Many Connected Accounts (+15)
        # Triggered if linked to >= 2 accounts
        acc_cnt = len(connected_accounts)
        if acc_cnt >= 2:
            raw_score += 15
            signals.append(RiskSignalItem(
                signal_name="Many Connected Accounts",
                score_impact=15,
                explanation=f"Entity is directly linked to {acc_cnt} separate user bank accounts."
            ))

        final_score = min(100, raw_score)
        risk_level = "HIGH" if final_score >= 70 else ("MEDIUM" if final_score >= 30 else "LOW")

        # Get readable entity name
        entity_name = self._get_entity_name(entity_id, entity_type)

        # Convert transactions subset to schema
        tx_items = []
        if not subset.empty:
            for _, row in subset.head(15).iterrows():
                tx_items.append(TransactionItem(
                    transaction_id=str(row["transaction_id"]),
                    user_id=str(row["user_id"]),
                    account_id=str(row["account_id"]),
                    device_id=str(row["device_id"]),
                    ip_address=str(row["ip_address"]),
                    merchant_id=str(row["merchant_id"]),
                    merchant_name=str(row["merchant_name"]),
                    amount=float(row["amount"]),
                    timestamp=str(row["timestamp"]),
                    location=str(row["location"]),
                    payment_method=str(row["payment_method"])
                ))

        total_amt = float(subset["amount"].sum()) if not subset.empty else 0.0

        return EntityDetail(
            entity_id=entity_id,
            entity_type=entity_type,
            name=entity_name,
            risk_score=final_score,
            risk_level=risk_level,
            risk_signals=signals,
            connected_entities=ConnectedEntities(
                users=connected_users,
                accounts=connected_accounts,
                devices=connected_devices,
                ip_addresses=connected_ips
            ),
            transaction_count=tx_count,
            total_amount=total_amt,
            transactions=tx_items
        )

    def _detect_entity_type(self, entity_id: str) -> str:
        eid = str(entity_id).upper()
        if eid.startswith("USER-"):
            return "user"
        elif eid.startswith("ACCOUNT-"):
            return "account"
        elif eid.startswith("DEVICE-"):
            return "device"
        elif eid.startswith("192.") or eid.startswith("10.") or eid.startswith("172.") or "." in eid:
            return "ip"
        elif eid.startswith("MERCH-"):
            return "merchant"
        elif eid.startswith("TX-"):
            return "transaction"
        return "unknown"

    def _get_entity_name(self, entity_id: str, entity_type: str) -> str:
        if entity_type == "user":
            match = self.users_df[self.users_df["user_id"] == entity_id]
            if not match.empty:
                return match.iloc[0]["name"]
            return entity_id
        elif entity_type == "merchant":
            match = self.merchants_df[self.merchants_df["merchant_id"] == entity_id]
            if not match.empty:
                return match.iloc[0]["merchant_name"]
            return entity_id
        elif entity_type == "device":
            return f"Device ({entity_id})"
        elif entity_type == "ip":
            return f"IP ({entity_id})"
        elif entity_type == "account":
            return f"Account ({entity_id})"
        return entity_id

    def get_all_entities_analysis(self) -> List[EntityDetail]:
        entities_list = []
        
        # Collect all unique entities
        users = self.users_df["user_id"].unique()
        accounts = self.accounts_df["account_id"].unique()
        devices = self.tx_df["device_id"].unique()
        ips = self.tx_df["ip_address"].unique()

        for u in users:
            entities_list.append(self.analyze_entity(u))
        for a in accounts:
            entities_list.append(self.analyze_entity(a))
        for d in devices:
            entities_list.append(self.analyze_entity(d))
        for ip in ips:
            entities_list.append(self.analyze_entity(ip))

        return sorted(entities_list, key=lambda x: x.risk_score, reverse=True)
