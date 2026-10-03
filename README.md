# TraceIQ — Entity Relationship & Risk Intelligence Platform

> **Find the connections hiding in your data.**

TraceIQ is an entity-risk intelligence platform built to uncover hidden relationships between **Users, Accounts, Devices, IP addresses, Transactions, and Merchants**. By connecting isolated transactions into an entity graph, TraceIQ calculates **transparent, rule-based risk scores** and provides instant, human-readable explanations for suspicious activity patterns.

---

## 🎯 The Problem

In modern fintech and payment ecosystems, fraudulent actors often evade single-transaction rules by spreading activity across multiple synthetic identities, shared devices, and proxy IP networks. 

Taken individually, each transaction appears standard:
- USER-001 spends $50 at Apex Electronics
- USER-004 spends $120 at Global Pay
- USER-009 transfers $80 via mobile app

However, when aggregated across an entity relationship graph, a critical risk signal emerges: **all four distinct users are transacting from identical hardware (`DEVICE-001`) and routing requests through a single shared IP (`192.168.1.104`) within a short timeframe.**

---

## 💡 The Solution

TraceIQ resolves entity relationships across transactions and evaluates them against an explainable rule-based risk scoring engine. 

Instead of black-box machine learning models, every risk score (0 to 100) comes with exact, transparent score breakdowns (e.g., `+25 Shared Device`, `+20 Shared IP`, `+20 High Velocity`), allowing fraud analysts and data engineers to trace the exact cause of any elevated risk level.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       React + Vite                          │
│               Tailwind CSS & Canvas Graph UI                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend (Python)                 │
│                 Routes, Pydantic & Validation               │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│     Risk Scoring Engine     │ │   Graph Relationship Engine │
│  (Explainable Signals +25)  │ │   (Nodes & Links Topology)  │
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
               └───────────────┬───────────────┘
                               │ Pandas DataFrame
┌──────────────────────────────▼──────────────────────────────┐
│                  Synthetic Transaction Dataset               │
│          Users, Accounts, Devices, IPs, Merchants           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

- 📊 **Executive Overview Dashboard**: High-level telemetry covering total users, linked accounts, monitored devices, risk score distribution, and active signal triggers.
- 🕸️ **Interactive Relationship Graph**: Canvas-rendered, force-directed graph with pan, zoom, node drag, and entity-type color coding (User, Account, Device, IP, Merchant).
- 🔍 **Deep Investigation Panel**: Drill down into any entity to inspect its risk score, exact score breakdown (+25 Shared device, etc.), connected entity topology, and transaction logs.
- 🔎 **Global Entity Search**: Instant autocomplete search across User IDs, Account IDs, Device IDs, IP addresses, and Transaction IDs.
- 🎯 **Risk Level Filters**: Dynamic filtering by Risk Level (High ≥70, Medium 30-69, Low <30) and Entity Type.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas API
- **Backend**: Python 3.13+, FastAPI, Uvicorn, Pandas, Pydantic v2
- **Data**: Synthetic Transaction Dataset (Pandas DataFrame)

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Start React Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔬 Example Risk Investigation

1. Open **TraceIQ** and navigate to the **Investigate** tab.
2. Select **`USER-001`** (Alex Rivera).
3. **Risk Analysis Result**:
   - **Risk Score**: `85 / 100` (HIGH RISK)
   - **Triggered Signals**:
     - `+25 Shared Device`: Associated with `DEVICE-001` shared across 4 distinct users (`USER-001`, `USER-004`, `USER-009`, `USER-015`).
     - `+20 Shared IP`: Transactions routed through `192.168.1.104` linked to 3 separate bank accounts.
     - `+20 High Velocity`: 25 rapid transactions recorded in a short timeframe.
     - `+20 Unusually High Amount`: Max transaction amount ($14,850.00) exceeds dataset baseline ($1,000.00).
   - **Connected Graph**: 4 Users, 3 Accounts, 1 Shared Device, 1 Shared IP.

---

## 🔮 Future Scalability & Architecture Improvements

For production deployment handling millions of streaming events per second, the architecture can scale to:

- 🗄️ **Graph Database**: Migrate entity topology storage from Pandas to **Neo4j** or **Amazon Neptune** for sub-second multi-hop graph queries.
- ⚡ **Stream Processing**: Integrate **Apache Kafka** and **Apache Flink** to compute real-time sliding window velocity counters.
- 📊 **Distributed Computing**: Utilize **Apache Spark (PySpark)** for daily offline graph analytics and community detection algorithms.
- 🔄 **Orchestration**: Deploy **Apache Airflow** to schedule batch feature extractions and dataset refreshes.
- ☁️ **Cloud Infrastructure**: Host raw transaction logs in **AWS S3 (Parquet format)** with **AWS Athena / Snowflake** query layer.

---

## 📄 License & Disclaimer

Built as a portfolio project for Data Engineer Internship evaluation. TraceIQ uses synthetic sample datasets and rule-based heuristics to highlight potential risk signals and connected entities. It does not process live financial transactions.
