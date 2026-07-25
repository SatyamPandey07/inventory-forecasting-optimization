# InventoryAI — Demand Forecasting & Inventory Optimization SaaS

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain intelligence SaaS product. It predicts demand, optimizes safety stock levels, monitors supplier reliability, and simulates financial risk under supply chain disruptions.

---

## 🏗️ Monorepo Structure

```text
/inventory-forecasting-optimization
  ├── /backend-api              # Node.js Express Gateway (Multi-tenant API, Auth, SKUs)
  ├── /forecasting-engine       # Python FastAPI Engine (Prophet, EOQ Math, LLM Reasoning)
  ├── /frontend                 # Next.js 14 + React + TypeScript Dashboard UI
  ├── /infra
  │   ├── /docker-compose.yml   # Multi-service local orchestration
  │   └── /db-migrations        # PostgreSQL + TimescaleDB schema SQL scripts
  ├── /docs                     # System Architecture & Design docs
  └── README.md
```

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
- [ ] **PR #2 — PostgreSQL + TimescaleDB Time-Series Data Pipelines**
- [ ] **PR #3 — Python Prophet Demand Forecasting Engine**
- [ ] **PR #4 — Safety Stock, ROP, and EOQ Inventory Optimization Engine**
- [ ] **PR #5 — Monte Carlo Supply Disruption Scenario Simulator**
- [ ] **PR #6 — LLM Executive Reasoning & Plain-English Explanations**
- [ ] **PR #7 — Node.js Express Gateway Multi-Tenant API Routes**
- [ ] **PR #8 — Next.js Executive Control Tower & Interactive Dashboard**
- [ ] **PR #9 — Celery Background Jobs, Grafana Observability, & CI/CD**