# InventoryAI — Demand Forecasting & Inventory Optimization SaaS

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain intelligence SaaS product. It predicts demand, optimizes safety stock levels, monitors supplier reliability, and simulates financial risk under supply chain disruptions.

---

## 🏗️ Monorepo Structure

```text
inventory-forecasting-optimization/
  ├── backend-api/              # Node.js Express Gateway (Multi-tenant API, Auth, SKUs)
  ├── forecasting-engine/       # Python FastAPI Engine (Prophet, EOQ Math, LLM Reasoning)
  ├── frontend/                 # Next.js 14 + React + TypeScript Dashboard UI
  ├── infra/
  │   ├── docker-compose.yml    # Multi-service local orchestration
  │   └── db-migrations/        # PostgreSQL + TimescaleDB schema SQL scripts
  ├── docs/                     # System Architecture & Design docs
  └── README.md
```

---

## 📈 Forecasting Engine

The core forecasting engine is powered by **Facebook Prophet** hosted inside the `/forecasting-engine` Python FastAPI microservice.

### Key Capabilities
- **Model Training (`POST /forecast/train`)**: Trains Prophet models using historical daily demand (`ds`, `y`). Automatically detects annual seasonality (holiday surges, back-to-school spikes), weekly weekend seasonality, and US country holidays. Serializes trained model binaries into Redis (`model:{org_id}:{sku_id}`).
- **90-Day Demand Prediction (`GET /forecast/predict`)**: Generates 90-day demand predictions returning point estimates along with 95% confidence bounds (`lower_bound`, `point_estimate`, `upper_bound`).
- **Accuracy Evaluation (`GET /forecast/accuracy`)**: Evaluates model precision against historical actuals by calculating **MAPE** (Mean Absolute Percentage Error) and **MAE** (Mean Absolute Error).
- **Automated Celery Retraining**: Celery beat schedule automatically triggers batch retraining every **Monday at 00:00 UTC** (`crontab(minute=0, hour=0, day_of_week='monday')`).
- **Sample Retail Data Loader (`scripts/seed_retail_data.py`)**: Generates 3 years (1,095 days) of daily demand history for 10 retail SKUs across multiple categories for performance testing.

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

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### Running the Full Stack

```bash
# Clone the repository
git clone https://github.com/SatyamPandey07/inventory-forecasting-optimization.git
cd inventory-forecasting-optimization

# Copy environment variables
cp .env.example .env

# Launch all microservices with Docker Compose
docker compose -f infra/docker-compose.yml up --build
```

### Microservice Endpoints
- **Next.js Dashboard:** `http://localhost:3000`
- **Node.js Express Gateway:** `http://localhost:4000/health`
- **Python FastAPI Engine Docs:** `http://localhost:8000/docs`
- **Grafana Monitoring:** `http://localhost:3001` (User: `admin` / Password: `admin`)

---

## 🗺️ 9-PR Implementation Roadmap

- [x] **PR #1 — Monorepo Scaffolding & Initial Schema Models**
- [x] **PR #2 — Core Prophet Demand Forecasting Engine**
- [ ] **PR #3 — Safety Stock, ROP, and EOQ Inventory Optimization Engine**
- [ ] **PR #4 — Monte Carlo Supply Disruption Scenario Simulator**
- [ ] **PR #5 — LLM Executive Reasoning & Plain-English Explanations**
- [ ] **PR #6 — Node.js Express Gateway Multi-Tenant API Routes**
- [ ] **PR #7 — Next.js Executive Control Tower & Interactive Dashboard**
- [ ] **PR #8 — Celery Background Jobs & Automated Retraining**
- [ ] **PR #9 — Grafana Observability, CI/CD Pipelines, & Final System Polish**