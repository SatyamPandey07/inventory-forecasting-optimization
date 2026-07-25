# InventoryAI — Demand Forecasting & Inventory Optimization SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-green.svg)](https://www.python.org/)
[![Node.js 20](https://img.shields.io/badge/Node.js-20-blue.svg)](https://nodejs.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Version](https://img.shields.io/badge/Version-v1.0.0-indigo.svg)](https://github.com/SatyamPandey07/inventory-forecasting-optimization/releases/tag/v1.0.0)

**InventoryAI** (DemandFlow) is a full-stack, open-source supply chain intelligence SaaS product. It predicts demand using Facebook Prophet, optimizes safety stock levels with SciPy numerical minimization, evaluates financial risk with Monte Carlo simulations, synthesizes prose reasoning using Anthropic Claude LLM, and provides operational visibility via Next.js dashboards and Grafana monitoring.

---

## 🏗️ Monorepo Architecture

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
  ├── docs/                     # System Architecture, Product, Operations & Roadmap docs
  └── README.md
```

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

### Microservice Endpoints
- **Next.js Executive Dashboard UI:** `http://localhost:3000`
- **Node.js Express Gateway:** `http://localhost:4000`
- **Python FastAPI Engine:** `http://localhost:8000` (`http://localhost:8000/docs` for OpenAPI Swagger)
- **Grafana Operational Dashboards:** `http://localhost:3001` (`admin` / `admin`)
- **Prometheus Metrics Server:** `http://localhost:9090`

---

## 📚 Technical Documentation

- 🏛️ [System Architecture & Multi-Tenant Specs](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/ARCHITECTURE.md)
- 🎯 [Product Guide & Business Walkthrough](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/PRODUCT.md)
- 🔧 [Operations & Maintenance Runbook](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/OPERATIONS.md)
- 🗺️ [Product Roadmap & Future Architecture](file:///Users/satyampandey/.gemini/antigravity-ide/scratch/inventory-forecasting-optimization/docs/ROADMAP.md)

---

## 🗺️ Completed 9-PR Implementation Roadmap

- [x] **PR #1 — Monorepo Scaffolding & Initial Schema Models**
- [x] **PR #2 — Core Prophet Demand Forecasting Engine**
- [x] **PR #3 — External Signals (Weather, Calendar Events, Competitor Tracking)**
- [x] **PR #4 — Claude LLM Executive Reasoning Layer**
- [x] **PR #5 — Multi-Objective Inventory Optimization Engine**
- [x] **PR #6 — Monte Carlo Supply Disruption Scenario Simulator**
- [x] **PR #7 — Next.js Executive Control Tower & Interactive Dashboard**
- [x] **PR #8 — Grafana Operational Dashboards & Prometheus Monitoring**
- [x] **PR #9 — Continuous Learning, Production Hardening & v1.0.0 Release**