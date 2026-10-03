import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_synthetic_dataset():
    random.seed(42)
    np.random.seed(42)

    # 1. Merchants
    merchants = [
        {"merchant_id": "MERCH-001", "merchant_name": "Apex Electronics"},
        {"merchant_id": "MERCH-002", "merchant_name": "Global Pay Services"},
        {"merchant_id": "MERCH-003", "merchant_name": "Velocity Digital Marketplace"},
        {"merchant_id": "MERCH-004", "merchant_name": "Cloud Crypto Exchange"},
        {"merchant_id": "MERCH-005", "merchant_name": "Urban Style Retail"},
        {"merchant_id": "MERCH-006", "merchant_name": "QuickMart Convenience"},
    ]

    # 2. Users (25 users)
    user_names = [
        "Alex Rivera", "Sophia Chen", "Marcus Vance", "Elena Rostova", "David Kim",
        "Rachel Green", "James Thorne", "Aisha Patel", "Carlos Mendez", "Hannah Abbott",
        "Liam Gallagher", "Zoe Saldana", "Viktor Nikiforov", "Maya Lin", "Ethan Hunt",
        "Olivia Wilde", "Noah Centineo", "Emma Watson", "Lucas Scott", "Mia Khalifa",
        "Benjamin Button", "Chloe Grace", "Daniel Craig", "Grace Hopper", "Alan Turing"
    ]
    
    users = []
    for i in range(1, 26):
        u_id = f"USER-{i:03d}"
        users.append({"user_id": u_id, "name": user_names[i-1]})

    # 3. Accounts (35 accounts)
    accounts = []
    acc_counter = 1
    for u in users:
        # Most users have 1 account, some high risk users have multiple
        u_id = u["user_id"]
        acc_count = 3 if u_id in ["USER-001", "USER-004", "USER-009"] else (2 if u_id in ["USER-002", "USER-015"] else 1)
        for _ in range(acc_count):
            acc_id = f"ACCOUNT-{acc_counter:03d}"
            accounts.append({"account_id": acc_id, "user_id": u_id})
            acc_counter += 1

    # Map user to accounts
    user_to_accs = {}
    for acc in accounts:
        user_to_accs.setdefault(acc["user_id"], []).append(acc["account_id"])

    # 4. Devices (15 devices)
    devices = [f"DEVICE-{i:03d}" for i in range(1, 16)]
    
    # 5. IP Addresses (15 IPs)
    ips = [f"192.168.1.{100 + i}" for i in range(1, 16)]

    # Intentional Suspicious Clusters:
    # Cluster A: DEVICE-001 shared by USER-001, USER-004, USER-009, USER-015
    shared_device = "DEVICE-001"
    suspicious_users_dev = ["USER-001", "USER-004", "USER-009", "USER-015"]

    # Cluster B: IP-104 (192.168.1.104) shared by ACCOUNT-002, ACCOUNT-008, ACCOUNT-013
    shared_ip = "192.168.1.104"
    suspicious_accs_ip = ["ACCOUNT-002", "ACCOUNT-008", "ACCOUNT-013"]

    locations = ["New York, US", "London, UK", "Tokyo, JP", "Berlin, DE", "Singapore, SG", "Toronto, CA", "Sydney, AU"]
    payment_methods = ["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "CRYPTO_PAY", "WALLET"]

    tx_list = []
    tx_counter = 1001

    base_time = datetime.now() - timedelta(days=7)

    # Generate transactions
    for u in users:
        u_id = u["user_id"]
        u_accs = user_to_accs[u_id]

        # Determine transaction count for user
        # High velocity for USER-001 & USER-004 (20+ transactions)
        if u_id in ["USER-001", "USER-004"]:
            n_tx = 25
        elif u_id in ["USER-009", "USER-015", "USER-002"]:
            n_tx = 12
        else:
            n_tx = random.randint(3, 7)

        for j in range(n_tx):
            tx_id = f"TX-{tx_counter}"
            tx_counter += 1

            acc_id = random.choice(u_accs)
            
            # Select device
            if u_id in suspicious_users_dev and random.random() < 0.8:
                dev_id = shared_device
            else:
                dev_id = f"DEVICE-{(int(u_id.split('-')[1]) % 15) + 1:03d}"

            # Select IP
            if acc_id in suspicious_accs_ip and random.random() < 0.85:
                ip_addr = shared_ip
            else:
                ip_addr = f"192.168.1.{(int(u_id.split('-')[1]) % 14) + 101}"

            # Amount
            # High amount trigger for specific transactions
            if u_id == "USER-001" and j in [2, 5, 8]:
                amount = round(random.uniform(7500, 15000), 2)
            elif u_id == "USER-004" and j in [1, 4]:
                amount = round(random.uniform(5000, 12000), 2)
            else:
                amount = round(random.uniform(15.0, 350.0), 2)

            # High velocity timestamp clustering for USER-001 & USER-004
            if u_id in ["USER-001", "USER-004"] and j > 5:
                # multiple transactions within 5-10 minutes window
                offset_minutes = random.randint(1, 15)
                timestamp = (base_time + timedelta(hours=12, minutes=offset_minutes * j)).strftime("%Y-%m-%dT%H:%M:%SZ")
            else:
                timestamp = (base_time + timedelta(hours=random.randint(1, 150), minutes=random.randint(0, 59))).strftime("%Y-%m-%dT%H:%M:%SZ")

            merch = random.choice(merchants)
            loc = random.choice(locations)
            pm = random.choice(payment_methods)

            tx_list.append({
                "transaction_id": tx_id,
                "user_id": u_id,
                "user_name": u["name"],
                "account_id": acc_id,
                "device_id": dev_id,
                "ip_address": ip_addr,
                "merchant_id": merch["merchant_id"],
                "merchant_name": merch["merchant_name"],
                "amount": amount,
                "timestamp": timestamp,
                "location": loc,
                "payment_method": pm
            })

    df = pd.DataFrame(tx_list)
    users_df = pd.DataFrame(users)
    accounts_df = pd.DataFrame(accounts)
    merchants_df = pd.DataFrame(merchants)

    return {
        "transactions": df,
        "users": users_df,
        "accounts": accounts_df,
        "merchants": merchants_df
    }

if __name__ == "__main__":
    data = generate_synthetic_dataset()
    print("Generated transactions count:", len(data["transactions"]))
