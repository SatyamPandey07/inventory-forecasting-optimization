# InventoryAI — System Architecture & Technical Specifications

**InventoryAI** (DemandFlow) is an open-source, full-stack supply chain demand forecasting and inventory optimization SaaS platform.

---

## 🏛️ Microservice Architecture Overview

```text
                               ┌──────────────────────────┐
                               │  Next.js 14 Dashboard UI │
                               │  (Port 3000)             │
                               └────────────┬─────────────┘
                                            │ HTTP / JSON
                               ┌────────────▼─────────────┐
                               │  Node.js Express Gateway │
                               │  (Port 4000)             │
                               └────────────┬─────────────┘
                                            │ HTTP API / REST
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
       ┌────────────▼─────────────┐                   ┌─────────────▼────────────┐
       │ Python FastAPI Engine    │                   │ PostgreSQL 15 +          │
       │ (Port 8000)              │                   │ TimescaleDB Hypertables  │
       │ Prophet | SciPy | Claude │                   │ (Port 5432)              │
       └────────────┬─────────────┘                   └──────────────────────────┘
                    │ Celery / Redis
       ┌────────────▼─────────────┐                   ┌──────────────────────────┐
       │ Redis 7 Cache & Queue    │                   │ Prometheus & Grafana     │
       │ (Port 6379)              │                   │ Observability (3001/9090)│
       └──────────────────────────┘                   └──────────────────────────┘
```

---

## 🔧 Core Microservices

### 1. Node.js Express Gateway (`backend-api`)
- **Port:** `4000`
- **Role:** Handles multi-tenant organization routing, user authentication (JWT), SKU catalog management, audit logging, and Prometheus metrics (`prom-client`).

### 2. Python FastAPI Intelligence Engine (`forecasting-engine`)
- **Port:** `8000`
- **Role:** Performs Facebook Prophet time-series demand forecasting, SciPy multi-objective cost optimization, Claude LLM reasoning, Monte Carlo scenario simulations, weather/holiday signal integration, and automated Celery model retraining.

### 3. PostgreSQL 15 + TimescaleDB Database (`infra/db-migrations/`)
- **Port:** `5432`
- **Role:** Stores hypertable time-series demand history, weather measurements, forecast confidence bands, inventory recommendations, supplier reliability ratings, and audit logs.

### 4. Redis Cache & Job Queue (`redis`)
- **Port:** `6379`
- **Role:** Caches serialized Prophet model binaries (`model:{org_id}:{sku_id}`), hashes Claude LLM responses for 1 hour (`llm_cache:{hash}`), and serves as Celery task broker.

### 5. Observability Stack (`prometheus`, `grafana`)
- **Ports:** Prometheus `9090`, Grafana `3001`
- **Role:** Scrapes `/metrics` endpoints across microservices, fires AlertManager alerts (MAPE < 70%, stockouts, API latency > 1s), and provisions 5 operational dashboards.

---

## 🔒 Multi-Tenant Data Isolation

Every database table references `org_id UUID NOT NULL REFERENCES organizations(id)`. All API endpoints validate the JWT token payload to ensure users can strictly access data belonging to their active tenant organization.
