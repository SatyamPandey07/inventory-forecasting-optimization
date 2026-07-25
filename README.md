# InventoryAI — Demand Forecasting & Inventory Optimization SaaS

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain intelligence SaaS product. It predicts demand, optimizes safety stock levels, monitors supplier reliability, and simulates financial risk under supply chain disruptions.

---

## 🏗️ Monorepo Structure

```text
inventory-forecasting-optimization/
  ├── backend-api/              # Node.js Express Gateway (Multi-tenant API, Auth, Metrics)
  ├── forecasting-engine/       # Python FastAPI Engine (Prophet, Signals, LLM, Prometheus)
  ├── frontend/                 # Next.js 14 + React + TypeScript Dashboard UI
  ├── infra/
  │   ├── docker-compose.yml    # Multi-service local orchestration
  │   ├── db-migrations/        # PostgreSQL + TimescaleDB schema SQL scripts
  │   ├── prometheus/           # Prometheus scraping config & AlertManager rules
  │   └── grafana/              # Provisioned operational Grafana dashboards & datasources
  ├── docs/                     # System Architecture & Design docs
  └── README.md
```

---

## 📉 Observability & Operational Dashboards

InventoryAI provides an open-source monitoring stack featuring **Prometheus** metrics collection, **AlertManager** alert rules, and 5 auto-provisioned **Grafana** operational dashboards:

### 1. Provisioned Grafana Dashboards (`http://localhost:3001`)
1. **Forecast Accuracy Dashboard**: Tracks MAPE %, MAE, and precision trends over time per SKU.
2. **Inventory Health Dashboard**: Monitors active stockout events (`inventory < ROP`), overstock warnings (`inventory > 2x ROP`), and turnover ratios.
3. **Cost Impact Dashboard**: Visualizes monthly carrying cost trends, stockout risk penalties, and AI reorder savings.
4. **Supplier Performance Dashboard**: Evaluates lead time variance, on-time delivery percentages, and quality ratings.
5. **System Health & Performance Dashboard**: Monitors API latency percentiles (p50, p95, p99), forecast job duration, and HTTP status codes.

### 2. Prometheus Metrics (`/metrics`)
- `forecast_accuracy`: Gauge tracking Prophet forecast accuracy (MAPE) per SKU.
- `inventory_stockouts`: Counter tracking detected stockout events.
- `recommendation_acceptance_rate`: Gauge tracking accepted AI recommendation ratio.
- `api_latency_seconds`: Histogram tracking HTTP request durations.
- `forecast_job_duration_seconds`: Histogram tracking batch retraining execution times.

### 3. AlertManager Rules (`infra/prometheus/alerts.yml`)
- `ForecastAccuracyLow`: Fires if forecast accuracy drops below 70% MAPE.
- `StockoutDetected`: Fires on stockout events.
- `ForecastJobFailed`: Fires if batch retraining job fails.
- `HighApiLatency`: Fires if p95 API latency exceeds 1.0s.

---

## 💻 Next.js React Dashboard UI

- **Executive Control Tower ([`app/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/page.tsx))**: Real-time inventory levels, demand trends, top SKUs table, auto-polling every 5 minutes, and CSV export.
- **AI Reorders & Decisions ([`app/recommendations/page.tsx`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/frontend/app/recommendations/page.tsx))**: Pending reorders, Claude LLM reasoning, Accept/Reject buttons, and CSV export.

---

## ⚙️ Open-Source Tech Stack

- **Backend Gateway:** Node.js + TypeScript (Express) + `prom-client`
- **Forecasting & ML Engine:** Python 3.11 + FastAPI + Facebook Prophet + `prometheus-client`
- **Database:** PostgreSQL 15 + TimescaleDB Extension (Time-series hypertables)
- **Cache & Async Queue:** Redis + Celery
- **Dashboard Frontend:** Next.js 14 + React + Tailwind CSS + Recharts
- **Observability:** Grafana + Prometheus + AlertManager

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
- [x] **PR #8 — Grafana Operational Dashboards & Prometheus Monitoring**
- [ ] **PR #9 — Final Integration, End-to-End System Polish, & Release**