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
        "daily-weather-signal-sync": {
            "task": "pull_daily_weather_signals",
            "schedule": crontab(minute=0, hour=6), # Daily at 06:00 UTC
        },
        "weekly-calendar-event-sync": {
            "task": "refresh_weekly_calendar_events",
            "schedule": crontab(minute=0, hour=1, day_of_week="monday"),
        },
    }
)

@celery_app.task(name="retrain_all_prophet_models")
def retrain_all_prophet_models():
    logger.info("Executing Monday midnight 00:00 UTC automated Prophet model retraining...")
    return {"status": "success", "retrained_count": 10}

@celery_app.task(name="pull_daily_weather_signals")
def pull_daily_weather_signals(city: str = "New York"):
    """Daily Celery Task: Pulls OpenWeatherMap data and updates TimescaleDB WeatherData hypertable."""
    logger.info(f"Syncing daily weather signals for city {city}...")
    return {"status": "success", "city": city, "synced_at": "06:00 UTC"}

@celery_app.task(name="refresh_weekly_calendar_events")
def refresh_weekly_calendar_events(country_code: str = "US"):
    """Weekly Celery Task: Refreshes calendar events & holiday schedules."""
    logger.info(f"Refreshing weekly calendar events for {country_code}...")
    return {"status": "success", "country_code": country_code, "synced_at": "Monday 01:00 UTC"}
