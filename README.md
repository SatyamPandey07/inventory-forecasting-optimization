# 📦 InventoryAI — Demand Forecasting & Inventory Optimization SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-green.svg)](https://www.python.org/)
[![Node.js 20](https://img.shields.io/badge/Node.js-20-blue.svg)](https://nodejs.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Version](https://img.shields.io/badge/Version-v1.0.0-indigo.svg)](https://github.com/SatyamPandey07/inventory-forecasting-optimization/releases/tag/v1.0.0)

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain optimization SaaS platform. It combines statistical demand forecasting, multi-objective cost optimization, generative AI executive reasoning, and Monte Carlo risk simulations to help retail businesses eliminate costly stockout lost sales and minimize warehouse holding capital.

---

## 💡 What is InventoryAI? (Layman's Terms Explanation)

Imagine running an e-commerce or retail business with hundreds of products. Managing inventory is a constant balancing act:
- **If you order too little stock**, items sell out. Customers leave disappointed, and you lose revenue (a **Stockout Penalty**).
- **If you order too much stock**, items sit in a warehouse for months, tying up cash flow and incurring high holding fees (a **Carrying Cost**).
- **If your supplier is delayed or bad weather hits**, your entire reorder plan falls apart.

**InventoryAI solves this automatically:**
1. **Predicts Demand**: Uses Facebook Prophet machine learning to look at past sales history, seasonal trends, and upcoming holidays to forecast exactly how many units will sell in the next 90 days.
2. **Calculates Optimal Reorder Point (EOQ)**: Automatically calculates the exact economic order quantity ($Q^*$) and safety buffer so you never run out of stock while spending the least money possible.
3. **Explains Decisions in Plain English**: Uses Anthropic Claude LLM to generate clear prose explanations (e.g. *"Reorder 140 units today because weather forecasts predict heavy rain next week, which will spike demand for raincoats by 25%"*).
4. **Simulates What-If Disruptions**: Runs 1,000 Monte Carlo simulation trials to show you financial risk percentiles under supply chain delays or demand spikes.

---

## 📸 Product Screenshots & Visual Tour

### 1. Executive Control Tower Dashboard (`/`)
*Real-time overview of active SKUs, 30-day sales volume, stockout risk alerts, and auto-polling updates.*

![Executive Control Tower Overview](file:///Users/satyampandey/.gemini/antigravity-ide/brain/5a5ce038-8481-42e8-8a26-c19e6a365a4d/executive_control_tower_overview_1784982272146.png)

---

### 2. AI Inventory Recommendations & Claude Reasoning (`/recommendations`)
*Autonomous reorder cards showing current stock, reorder point (ROP), expected cost savings ($1,850 saved), Anthropic Claude prose reasoning, and Accept/Reject buttons.*

![AI Reorder Recommendations](file:///Users/satyampandey/.gemini/antigravity-ide/brain/5a5ce038-8481-42e8-8a26-c19e6a365a4d/accepted_recommendation_1784982316277.png)

---

### 3. What-If Scenario Simulator (`/simulator`)
*Interactive sliders for supplier lead time delays (+9 Days) and demand surges (+37%), running 1,000 Monte Carlo trials to plot cost distribution histograms and risk percentiles (p10, p50, p90, p95).*

![What-If Scenario Simulator](file:///Users/satyampandey/.gemini/antigravity-ide/brain/5a5ce038-8481-42e8-8a26-c19e6a365a4d/what_if_simulator_after_run_1784982444751.png)

---

### 4. Forecast Analytics & Decision Audit (`/analytics`)
*MAPE accuracy trends over time (4.5% error rate), MAE tracking, and audit log of implemented decisions and net financial impact (+$5,450.00 saved).*

![Forecast Analytics & Decision Audit](file:///Users/satyampandey/.gemini/antigravity-ide/brain/5a5ce038-8481-42e8-8a26-c19e6a365a4d/analytics_page_1784982487671.png)

---

## 🏗️ Monorepo Architecture & Microservices

```text
inventory-forecasting-optimization/
  ├── backend-api/              # Node.js Express Gateway (Multi-tenant API, Auth, Metrics)
  ├── forecasting-engine/       # Python FastAPI Engine (Prophet, Signals, LLM, Simulator)
  ├── frontend/                 # Next.js 14 + React + TypeScript Dashboard UI
  ├── infra/
  │   ├── docker-compose.yml    # Multi-service local orchestration
  │   ├── db-migrations/        # PostgreSQL + TimescaleDB schema SQL scripts
  │   ├── prometheus/           # Prometheus scraping config & AlertManager rules
  │   └── grafana/              # Provisioned operational Grafana dashboards & datasources
  ├── docs/                     # Architecture, Product, Operations & Roadmap documentation
  └── README.md
```

### Microservice Ports & Endpoints
- **Next.js Executive Dashboard UI:** `http://localhost:3000`
- **Node.js Express Gateway:** `http://localhost:4000`
- **Python FastAPI Engine:** `http://localhost:8000` (`http://localhost:8000/docs` Swagger UI)
- **Grafana Operational Monitoring:** `http://localhost:3001` (`admin` / `admin`)
- **Prometheus Metrics Server:** `http://localhost:9090`

---

## 🚀 Quick Start (Local Setup & Deployment)

```bash
# 1. Clone the repository
git clone https://github.com/SatyamPandey07/inventory-forecasting-optimization.git
cd inventory-forecasting-optimization

# 2. Copy environment variables
cp .env.example .env

# 3. Launch all microservices using Docker Compose
docker compose -f infra/docker-compose.yml up --build
```

---

## 📚 Detailed Documentation

- 🏛️ [System Architecture & Multi-Tenant Specs](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/ARCHITECTURE.md)
- 🎯 [Product Guide & Business Walkthrough](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/PRODUCT.md)
- 🔧 [Operations & Maintenance Runbook](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/OPERATIONS.md)
- 🗺️ [Product Roadmap & Future Architecture](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/ROADMAP.md)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.