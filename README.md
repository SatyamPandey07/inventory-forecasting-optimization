# 📦 InventoryAI — Demand Forecasting & Inventory Optimization SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-green.svg)](https://www.python.org/)
[![Node.js 20](https://img.shields.io/badge/Node.js-20-blue.svg)](https://nodejs.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Version](https://img.shields.io/badge/Version-v1.0.0-indigo.svg)](https://github.com/SatyamPandey07/inventory-forecasting-optimization/releases/tag/v1.0.0)

**InventoryAI** (DemandFlow) is an enterprise-grade, open-source supply chain intelligence SaaS platform. It combines time-series demand forecasting, multi-objective economic order quantity (EOQ) cost optimization, generative AI executive reasoning, and Monte Carlo risk simulations to eliminate costly stockout lost sales and minimize warehouse holding capital.

---

## 🎯 Executive Overview & Product Functionality

Managing retail inventory requires balancing two conflicting financial pressures:
- **Stockout Risk**: Ordering too little inventory leads to stockouts, unfulfilled customer demand, and lost sales revenue.
- **Carrying Cost**: Ordering excessive inventory ties up working capital and incurs warehouse storage, insurance, and holding fees.

**InventoryAI** automates end-to-end inventory management through five core capabilities:

1. **Predictive Time-Series Demand Engine**: Utilizes Facebook Prophet to analyze historical demand patterns, annual and weekly seasonality, holiday spikes, and external weather signals to generate 90-day forward demand predictions with 95% confidence bounds.
2. **Multi-Objective Inventory Optimization**: Calculates optimal Economic Order Quantities ($Q^*$), dynamic Safety Stock levels, and Reorder Points (ROP) using numerical minimization (`scipy.optimize`), balancing carrying costs against stockout penalties while enforcing supplier minimum order quantities (`min_order_qty`) and lead time constraints.
3. **Generative AI Executive Reasoning Layer**: Integrates Anthropic Claude (`claude-3-5-sonnet`) to synthesize multi-signal inputs (forecast trends, OpenWeatherMap weather patterns, public holiday calendars, competitor stockouts) into actionable, plain-language executive prose recommendations.
4. **What-If Monte Carlo Scenario Simulator**: Performs discrete-event simulations across 1,000 trial runs over a 90-day horizon, calculating risk percentiles ($p_{10}, p_{50}, p_{90}, p_{95}$) and outcome cost distributions under supply chain disruptions, lead time delays, and demand shocks.
5. **Operational Observability & Analytics**: Exposes Prometheus metrics across microservices, provisions 5 operational Grafana dashboards, tracks forecast accuracy trends (MAPE / MAE), and logs user recommendation acceptance outcomes for verifiable financial ROI auditing.

---

## 📸 Interface & Product Visual Tour

### 1. Executive Control Tower Dashboard (`/`)
Real-time monitoring dashboard displaying active monitered SKUs, 30-day aggregate sales volume, revenue metrics, stockout risk alerts, top monitored stock levels, 5-minute auto-polling status, and CSV data export.

![Executive Control Tower Overview](docs/images/overview_dashboard.png)

---

### 2. AI Inventory Recommendations & Claude Reasoning (`/recommendations`)
Autonomous reorder recommendation cards displaying calculated order quantities, safety buffers, expected cost savings ($1,850 saved by avoiding stockouts), order value impact, Anthropic Claude prose executive reasoning, and Accept/Reject decision controls.

![AI Reorder Recommendations](docs/images/ai_recommendations.png)

---

### 3. What-If Scenario Simulator (`/simulator`)
Interactive simulation interface featuring sliders for supplier lead time delays (+9 Days) and demand surge variance (+37%). Executes 1,000 Monte Carlo trial runs to compute total cost distributions, rendered on a 10-bin histogram bar chart alongside 10th, 50th, 90th, and 95th percentile risk metrics.

![What-If Scenario Simulator](docs/images/scenario_simulator.png)

---

### 4. Forecast Analytics & Decision Audit (`/analytics`)
Comprehensive accuracy tracking displaying Prophet model Mean Absolute Percentage Error (MAPE) trends over time (4.5% error rate), Mean Absolute Error (MAE), aggregate net financial cost savings impact (+$5,450.00 saved), and decision history audit logs.

![Forecast Analytics & Decision Audit](docs/images/forecast_analytics.png)

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

### Microservice Endpoints & Ports
- **Next.js Executive Dashboard UI:** `http://localhost:3000`
- **Node.js Express Gateway:** `http://localhost:4000`
- **Python FastAPI Engine:** `http://localhost:8000` (`http://localhost:8000/docs` OpenAPI Swagger)
- **Grafana Operational Monitoring:** `http://localhost:3001` (`admin` / `admin`)
- **Prometheus Metrics Server:** `http://localhost:9090`

---

## 🚀 Quick Start & Deployment Guide

### Prerequisites
- Docker Engine 20.10+ & Docker Compose v2+
- Node.js 20+ & Python 3.11 (for local non-containerized development)

### Deployment Steps

```bash
# 1. Clone the repository
git clone https://github.com/SatyamPandey07/inventory-forecasting-optimization.git
cd inventory-forecasting-optimization

# 2. Copy environment variable template
cp .env.example .env

# 3. Launch all microservices using Docker Compose
docker compose -f infra/docker-compose.yml up --build -d

# 4. Verify running container health
docker compose -f infra/docker-compose.yml ps
```

---

## 📚 Technical Documentation

- 🏛️ [System Architecture & Multi-Tenant Specs](docs/ARCHITECTURE.md)
- 🎯 [Product Guide & Functional Capabilities](docs/PRODUCT.md)
- 🔧 [Operations & Maintenance Runbook](docs/OPERATIONS.md)
- 🗺️ [Product Roadmap & Future Expansion](docs/ROADMAP.md)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.