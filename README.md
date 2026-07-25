# InventoryAI — Demand Forecasting & Inventory Optimization SaaS

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain intelligence SaaS product. It predicts demand, optimizes safety stock levels, monitors supplier reliability, and simulates financial risk under supply chain disruptions.

---

## 🏗️ Monorepo Structure

```text
inventory-forecasting-optimization/
  ├── backend-api/              # Node.js Express Gateway (Multi-tenant API, Auth, SKUs)
  ├── forecasting-engine/       # Python FastAPI Engine (Prophet, Signals, LLM, Simulator)
  ├── frontend/                 # Next.js 14 + React + TypeScript Dashboard UI
  ├── infra/
  │   ├── docker-compose.yml    # Multi-service local orchestration
  │   └── db-migrations/        # PostgreSQL + TimescaleDB schema SQL scripts
  ├── docs/                     # System Architecture & Design docs
  └── README.md
```

---

## 💻 Next.js React Dashboard UI

InventoryAI features a responsive dashboard built with **Next.js 14**, **React**, **Tailwind CSS**, and **Recharts**:

1. **Executive Control Tower ([`app/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/page.tsx))**: Real-time inventory levels, demand trends, top SKUs table, auto-polling every 5 minutes, and CSV export.
2. **AI Reorders & Decisions ([`app/recommendations/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/recommendations/page.tsx))**: Pending reorder recommendations, expected cost savings, Claude LLM prose reasoning, Accept/Reject buttons, and CSV export.
3. **What-If Scenario Simulator ([`app/simulator/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/simulator/page.tsx))**: Sliders for lead time delay and demand variance, executing 1,000 Monte Carlo trials and plotting cost outcome distributions as a histogram bar chart.
4. **Supplier Performance Scorecard ([`app/suppliers/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/suppliers/page.tsx))**: Supplier lead times, reliability ratings, and quality scores.
5. **Settings & SKU Manager ([`app/settings/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/settings/page.tsx))**: Organization details, add new SKU form, carrying cost % and stockout penalty constraints.
6. **Analytics & Precision Tracking ([`app/analytics/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/analytics/page.tsx))**: Forecast precision metrics (MAPE/MAE trends over time) and decision cost savings audit.

---

## 🎲 Scenario Planning & Cost Simulator

- **Percentile Metrics**: 10th (`p10`), 50th (`p50` median), 90th (`p90`), and 95th (`p95` worst-case risk).
- **Histogram Visualization Payload**: 10 frequency bins (`bin_edges`, `counts`, `bin_centers`) formatted for histogram charts.

---

## 📊 Optimization Algorithm Engine

- **Cost Minimization**: Minimizes Total Monthly Cost = Carrying Cost + Stockout Penalty.
- **Supplier Constraints**: Automatically rounds to supplier `min_order_qty` minimums and flags `URGENT_IMMEDIATE` reorder alerts when supplier lead time $\ge 14$ days.

---

## 🤖 LLM Integration & Reasoning Layer

- **Multi-Signal Synthesis (`POST /recommendations/reason`)**: Combines 30-day Prophet forecast demand, OpenWeatherMap signals, holiday events, competitor stockouts, and current stock.
- **1-Hour Redis Caching (`llm_cache:{hash}`)**: Hashes request payloads to cache responses for 1 hour (3,600s).

---

## ⚙️ Open-Source Tech Stack

- **Backend Gateway:** Node.js + TypeScript (Express)
- **Forecasting & ML Engine:** Python 3.11 + FastAPI + Facebook Prophet + SciPy + NumPy
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
- [x] **PR #6 — Monte Carlo Supply Disruption Scenario Simulator**
- [x] **PR #7 — Next.js Executive Control Tower & Interactive Dashboard**
- [ ] **PR #8 — Celery Background Jobs & Automated Retraining**
- [ ] **PR #9 — Grafana Observability & Final System Polish**