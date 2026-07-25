# Architecture & System Design — InventoryAI

**InventoryAI** (DemandFlow) is an open-source supply chain intelligence and inventory optimization platform designed to predict demand, recommend optimal stocking levels, monitor supplier performance, and simulate supply chain cost risks.

---

## High-Level System Architecture

```
[ Retailer / Manufacturer User ]
                │
                ▼
   [ Next.js + React Dashboard ] (Port 3000)
                │
       ┌────────┴──────────────────────────┐
       ▼                                   ▼
[ Node.js Express Gateway ]      [ Grafana Dashboards ] (Port 3001)
 (Port 4000: Auth, Multi-tenant)
       │
       ▼
[ PostgreSQL + TimescaleDB ] ◄────┐
 (Port 5432: Hypertables)          │
       ▲                           │
       │                           ▼
       │               [ Python FastAPI Engine ] (Port 8000)
       │               ├── Prophet Time-Series Forecaster
       │               ├── EOQ / Safety Stock Math
       │               ├── Monte Carlo Scenario Simulator
       │               └── Claude LLM / Rule Reasoning
       │                           │
       └───────────────────────────┼───────────────────────────┐
                                   ▼                           ▼
                             [ Redis Cache ] ◄──► [ Celery Background Worker ]
                              (Port 6379)
```

---

## Open-Source Tech Stack

| Service Layer | Technology Chosen | Technical Rationale |
|---|---|---|
| **Core AI Engine** | Python 3.11 + FastAPI | Native environment for machine learning, Prophet time-series models, and LLM orchestration. |
| **Business & Gateway API** | Node.js + TypeScript (Express) | High-throughput asynchronous routing, multi-tenant middleware, and user management. |
| **Forecasting Engine** | Facebook Prophet | Open-source time-series forecasting with automatic holiday, trend, and weekly seasonality support. |
| **Time-Series Database** | PostgreSQL 15 + TimescaleDB | Open-source hypertable engine optimized for high-volume daily sales and stock level data. |
| **Job Queue & Cache** | Redis + Celery | Scheduled nightly forecasts, weekly model retraining, and real-time query caching. |
| **Dashboard UI** | Next.js 14 + React + Tailwind CSS | Modern server-rendered web application with interactive Recharts visualizations. |
| **Observability** | Prometheus + Grafana | Standardized open-source system performance and alert monitoring stack. |

---

## Data Model & Hypertables

### Hypertables
- `demand_history` (`time`, `org_id`, `sku_id`, `units_sold`, `revenue`)
- `inventory_levels` (`time`, `org_id`, `sku_id`, `units_on_hand`, `units_on_order`)
- `weather_data` (`time`, `org_id`, `location`, `temp`, `humidity`, `precipitation`)

### Relational Schema
- `organizations` (`id`, `name`, `tier`, `created_at`)
- `users` (`id`, `org_id`, `name`, `email`, `role`, `created_at`)
- `skus` (`id`, `org_id`, `sku_code`, `name`, `category`, `unit_cost`, `unit_price`, `reorder_point`, `safety_stock`, `economic_order_qty`, `lead_time_days`)
- `suppliers` (`id`, `org_id`, `name`, `contact_email`, `lead_time_days`, `reliability_score`, `quality_score`)
- `inventory_recommendations` (`id`, `org_id`, `sku_id`, `recommended_qty`, `safety_stock`, `reorder_point`, `reason`, `cost_impact`, `status`)
