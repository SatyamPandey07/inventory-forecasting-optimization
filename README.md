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

## ⛅ External Signals Engine

InventoryAI integrates external exogenous factors to refine demand forecasts:

### 1. OpenWeatherMap Weather Integration (`GET /signals/weather`)
- Synchronizes temperature, humidity, and precipitation data into the TimescaleDB `weather_data` hypertable.
- **Configuration:** Add your free API key in `.env`:
  ```env
  OPENWEATHER_API_KEY=your_openweather_api_key_here
  ```

### 2. Calendar & Holiday Signals (`GET /signals/events`)
- Automatically detects national holidays (US/Global) and commercial shopping dates (Black Friday, Cyber Monday, Back-to-School, Christmas) stored in `calendar_events`.

### 3. Competitor Price Tracking (`GET & POST /signals/competitor`)
- Endpoint for recording competitor prices per SKU (`competitor_prices`).
- Architectural documentation for enterprise scraping using **Bright Data** Web Unlocker & SERP API is available in [`docs/competitor_tracking.md`](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/competitor_tracking.md).

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
- [ ] **PR #4 — Safety Stock, ROP, and EOQ Inventory Optimization Engine**
- [ ] **PR #5 — Monte Carlo Supply Disruption Scenario Simulator**
- [ ] **PR #6 — LLM Executive Reasoning & Plain-English Explanations**
- [ ] **PR #7 — Node.js Express Gateway Multi-Tenant API Routes**
- [ ] **PR #8 — Next.js Executive Control Tower & Interactive Dashboard**
- [ ] **PR #9 — Grafana Observability & Final System Polish**