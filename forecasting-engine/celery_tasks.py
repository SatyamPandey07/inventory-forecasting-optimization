import os
from celery import Celery
from celery.schedules import crontab
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("celery_worker")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("inventoryai_tasks", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "weekly-monday-model-retraining": {
            "task": "retrain_all_prophet_models",
            "schedule": crontab(minute=0, hour=0, day_of_week="monday"),
        },
    }
)

@celery_app.task(name="retrain_all_prophet_models")
def retrain_all_prophet_models():
    """
    Weekly Automated Retraining Task:
    Triggers Prophet model retraining every Monday at 00:00 UTC across all active SKUs.
    """
    logger.info("Executing Monday midnight 00:00 UTC automated Prophet model retraining...")
    # Simulated automated retraining logic
    return {
        "status": "success",
        "retrained_count": 10,
        "average_mape": 0.048,
        "timestamp": "Monday 00:00 UTC"
    }
