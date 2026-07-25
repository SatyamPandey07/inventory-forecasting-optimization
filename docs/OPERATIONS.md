# InventoryAI — Operations, Deployment & Maintenance Guide

Operational runbook for deploying, monitoring, and maintaining **InventoryAI** in production environments.

---

## 🚀 Production Deployment via Docker Compose

```bash
# 1. Clone repository
git clone https://github.com/SatyamPandey07/inventory-forecasting-optimization.git
cd inventory-forecasting-optimization

# 2. Configure production environment variables
cp .env.example .env

# 3. Build and launch all microservices in detached mode
docker compose -f infra/docker-compose.yml up --build -d

# 4. Verify health of all services
docker compose -f infra/docker-compose.yml ps
```

---

## 📊 Monitoring & Alerts Setup

- **Grafana Dashboard**: Access `http://localhost:3001` (Default credentials: `admin` / `admin`).
- **Prometheus Metrics**: Scraped every 15 seconds at `http://localhost:9090`.

### Operational Alerts
- `ForecastAccuracyLow`: Triggers if Prophet MAPE drops below 70%.
- `StockoutDetected`: Triggers on active stockout events.
- `HighApiLatency`: Triggers if p95 HTTP response duration exceeds 1.0s.

---

## 🔄 Automated Model Retraining & Maintenance

- **Weekly Retraining Pipeline**: Executed automatically via Celery Beat every Monday at `00:00 UTC`.
- **Champion / Challenger Validation**: Compares new model MAPE against existing model. Only promotes new model if accuracy improves.
- **Annual Data Retention Cleanup**: Celery job purges forecast records older than 365 days every Sunday at `02:00 UTC`.
