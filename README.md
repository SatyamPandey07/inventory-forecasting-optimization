# InventoryAI — Demand Forecasting & Inventory Optimization SaaS

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain intelligence SaaS product. It predicts demand, optimizes safety stock levels, monitors supplier reliability, and simulates financial risk under supply chain disruptions.

---

## 🏗️ Monorepo Structure

```text
inventory-forecasting-optimization/
  ├── backend-api/              # Node.js Express Gateway (Multi-tenant API, Auth, SKUs)
  ├── forecasting-engine/       # Python FastAPI Engine (Prophet, Signals, LLM, Optimization)
  ├── frontend/                 # Next.js 14 + React + TypeScript Dashboard UI
  ├── infra/
  │   ├── docker-compose.yml    # Multi-service local orchestration
  │   └── db-migrations/        # PostgreSQL + TimescaleDB schema SQL scripts
  ├── docs/                     # System Architecture & Design docs
  └── README.md
```

---

## 📊 Optimization Algorithm Engine

InventoryAI implements a multi-objective inventory optimization algorithm (`POST /optimize/inventory`) that balances holding costs vs stockout penalties under supply chain constraints:

### Cost Minimization Objective
$$\text{Total Monthly Cost}(Q) = \text{Carrying Cost}(Q) + \text{Ordering Cost}(Q) + \text{Expected Stockout Risk Cost}(Q)$$
- Uses `scipy.optimize.minimize_scalar` to calculate the optimal order quantity ($Q^*$).
- Safety stock calculation incorporates supplier lead time reliability weighting:
  $$\text{Effective Lead Time} = \text{Lead Time Days} \times \left(1 + (1 - \text{Reliability Score})\right)$$

### Supplier Constraint Enforcement
1. **Minimum Order Quantity (`min_order_qty`)**: If calculated $Q^* < \text{min\_order\_qty}$, automatically rounds up to satisfy supplier minimums or flags alternative suppliers.
2. **Lead Time Urgency Rules**: If supplier lead time $\ge 14$ days and current stock $\le \text{ROP}$, triggers an immediate `URGENT_IMMEDIATE` reorder recommendation.

---

## 🤖 LLM Integration & Reasoning Layer

- **Multi-Signal Synthesis (`POST /recommendations/reason`)**: Combines 30-day Prophet forecast demand, OpenWeatherMap signals, holiday events, competitor stockouts, and current stock.
- **1-Hour Redis Caching (`llm_cache:{hash}`)**: Hashes request payloads to cache responses for 1 hour (3,600s).

---

## ⚙️ Open-Source Tech Stack

- **Backend Gateway:** Node.js + TypeScript (Express)
- **Forecasting & ML Engine:** Python 3.11 + FastAPI + Facebook Prophet + SciPy
- **Database:** PostgreSQL 15 + TimescaleDB Extension (Time-series hypertables)
- **Cache & Async Queue:** Redis + Celery
- **Dashboard Frontend:** Next.js 14 + React + Tailwind CSS + Recharts
- **Observability:** Grafana + Prometheus

---

## 🚀 Quick Start (Local Setup)

```bash
# Clone the repository
git clone https://github.com/SatyamPandey07/inventory-forecasting-optimization.git
cd inventory-forecasting-optimization

# Copy environment variables
cp .env.example .env

# Launch all microservices with Docker Compose
docker compose -f infra/docker-compose.yml up --build
```

---

## 🗺️ 9-PR Implementation Roadmap

- [x] **PR #1 — Monorepo Scaffolding & Initial Schema Models**
- [x] **PR #2 — Core Prophet Demand Forecasting Engine**
- [x] **PR #3 — External Signals (Weather, Calendar Events, Competitor Tracking)**
- [x] **PR #4 — Claude LLM Executive Reasoning Layer**
- [x] **PR #5 — Multi-Objective Inventory Optimization Engine**
- [ ] **PR #6 — Monte Carlo Supply Disruption Scenario Simulator**
- [ ] **PR #7 — Node.js Express Gateway Multi-Tenant API Routes**
- [ ] **PR #8 — Next.js Executive Control Tower & Interactive Dashboard**
- [ ] **PR #9 — Grafana Observability & Final System Polish**