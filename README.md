# InventoryAI — Demand Forecasting & Inventory Optimization SaaS

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain intelligence SaaS product. It predicts demand, optimizes safety stock levels, monitors supplier reliability, and simulates financial risk under supply chain disruptions.

---

## 🏗️ Monorepo Structure

```text
inventory-forecasting-optimization/
  ├── backend-api/              # Node.js Express Gateway (Multi-tenant API, Auth, SKUs)
  ├── forecasting-engine/       # Python FastAPI Engine (Prophet, Signals, LLM Reasoning)
  ├── frontend/                 # Next.js 14 + React + TypeScript Dashboard UI
  ├── infra/
  │   ├── docker-compose.yml    # Multi-service local orchestration
  │   └── db-migrations/        # PostgreSQL + TimescaleDB schema SQL scripts
  ├── docs/                     # System Architecture & Design docs
  └── README.md
```

---

## 🤖 LLM Integration & Reasoning Layer

InventoryAI embeds **Anthropic Claude API** (`claude-3-5-sonnet-20241022`) to provide plain-English executive explanations for inventory decisions.

### Key Capabilities
- **Multi-Signal Prompt Synthesis (`POST /recommendations/reason`)**: Combines 30-day Prophet forecast demand, weather forecasts (e.g. rain/snow demand surges), holiday calendar events (Black Friday, Christmas), competitor stockout signals, and current stock levels.
- **Structured JSON Output**:
  ```json
  {
    "recommended_qty": 140,
    "reasoning": "[URGENT REORDER] Current stock (38 units) has fallen below the reorder point (48 units). Reordering 140 units captures projected 30-day forecast demand (120 units) plus a 15% buffer for Black Friday promotional traffic.",
    "confidence_score": 0.94,
    "suggested_action": "REORDER_URGENT"
  }
  ```
- **1-Hour Redis Caching (`llm_cache:{hash}`)**: Hashes multi-signal request payloads to cache response outputs in Redis for 1 hour (3,600s), preventing redundant API billing.
- **Rule-Based Fallback Engine**: Automatically executes an analytical fallback model if the Claude API key is missing or unconfigured, returning valid recommendations with `confidence: 0.70`.

---

## ⛅ External Signals Engine

- **OpenWeatherMap Integration (`GET /signals/weather`)**: Synchronizes weather data into `weather_data` TimescaleDB hypertable.
- **Calendar & Holiday Signals (`GET /signals/events`)**: Detects national holidays and commercial events.
- **Competitor Price Tracking (`GET & POST /signals/competitor`)**: Records competitor pricing per SKU (`competitor_prices`). Architectural doc: [`docs/competitor_tracking.md`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/competitor_tracking.md).

---

## ⚙️ Open-Source Tech Stack

- **Backend Gateway:** Node.js + TypeScript (Express)
- **Forecasting & ML Engine:** Python 3.11 + FastAPI + Facebook Prophet
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
- [ ] **PR #5 — Safety Stock, ROP, and EOQ Inventory Optimization Engine**
- [ ] **PR #6 — Monte Carlo Supply Disruption Scenario Simulator**
- [ ] **PR #7 — Node.js Express Gateway Multi-Tenant API Routes**
- [ ] **PR #8 — Next.js Executive Control Tower & Interactive Dashboard**
- [ ] **PR #9 — Grafana Observability & Final System Polish**