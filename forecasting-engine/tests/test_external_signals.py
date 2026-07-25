import pytest
from weather_events import ExternalDataEnricher

@pytest.mark.asyncio
async def test_get_weather_forecast():
    enricher = ExternalDataEnricher()
    data = await enricher.get_weather_forecast("New York")
    
    assert "city" in data
    assert "current" in data
    assert "temp_celsius" in data["current"]

def test_get_upcoming_events():
    enricher = ExternalDataEnricher()
    events = enricher.get_upcoming_events(2026, "US")
    
    assert len(events) >= 5
    event_names = [e["event_name"] for e in events]
    assert "Black Friday" in event_names
    assert "Christmas Day" in event_names
