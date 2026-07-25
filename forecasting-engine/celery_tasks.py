from celery import Celery
from celery.schedules import crontab
import os
import json
import redis
import psycopg2
import pandas as pd
from forecaster import ProphetDemandEngine

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://inventory_user:inventory_password@localhost:5432/inventoryai")

celery_app = Celery("inventory_tasks", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.beat_schedule = {
    "weekly-prophet-retraining-monday-midnight": {
        "task": "celery_tasks.weekly_retrain_all_skus",
        "schedule": crontab(hour=0, minute=0, day_of_week="monday"), # Monday 00:00 UTC
    },
    "archive-forecasts-older-than-1-year": {
        "task": "celery_tasks.archive_old_forecasts",
        "schedule": crontab(hour=2, minute=0, day_of_week="sunday"), # Sunday 02:00 UTC
    }
}
celery_app.conf.timezone = "UTC"

engine = ProphetDemandEngine()

@celery_app.task
def weekly_retrain_all_skus():
    """
    Weekly automated retraining pipeline (Monday 00:00 UTC):
    Retrains Prophet models for all active SKUs across tenants, running
    Champion/Challenger MAPE comparison before saving model binaries to Redis.
    """
    print("[Celery Beat] Initiating weekly Prophet model retraining task...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        r = redis.Redis.from_url(REDIS_URL)

        cursor.execute("SELECT id, org_id, sku_code FROM skus;")
        skus = cursor.fetchall()

        promoted_count = 0
        retained_count = 0

        for sku_id, org_id, sku_code in skus:
            cursor.execute(
                "SELECT date AS ds, units_sold AS y FROM demand_history WHERE sku_id = %s ORDER BY date ASC;",
                (sku_id,)
            )
            rows = cursor.fetchall()
            if len(rows) < 14:
                continue

            df = pd.DataFrame(rows, columns=['ds', 'y'])
            model_key = f"model:{org_id}:{sku_id}"
            existing_bytes = r.get(model_key)

            result = engine.train_champion_challenger(df, str(sku_id), existing_bytes)

            if result["action"] in ["PROMOTED_INITIAL", "PROMOTED_CHALLENGER"]:
                r.set(model_key, result["model_bytes"])
                promoted_count += 1
            else:
                retained_count += 1

            print(f"[Weekly Retrain] SKU {sku_code}: {result['reason']}")

        cursor.close()
        conn.close()
        return {"status": "success", "promoted": promoted_count, "retained": retained_count}
    except Exception as e:
        print(f"[Weekly Retrain Error] {str(e)}")
        return {"status": "error", "message": str(e)}

@celery_app.task
def archive_old_forecasts():
    """
    Data retention cleanup task:
    Archives and purges forecasts older than 365 days (1 year) to maintain database efficiency.
    """
    print("[Celery Beat] Executing annual forecast data retention purge...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM forecasts WHERE created_at < NOW() - INTERVAL '365 days';")
        deleted_count = cursor.rowcount
        conn.commit()
        cursor.close()
        conn.close()
        print(f"[Data Retention] Purged {deleted_count} forecast records older than 1 year.")
        return {"status": "success", "deleted_forecasts": deleted_count}
    except Exception as e:
        print(f"[Data Retention Error] {str(e)}")
        return {"status": "error", "message": str(e)}
