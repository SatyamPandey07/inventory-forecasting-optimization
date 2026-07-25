import pytest
from llm_reasoner import LLMReasoningEngine

@pytest.mark.asyncio
async def test_llm_fallback_reasoning():
    engine = LLMReasoningEngine()
    result = await engine.generate_reasoning(
        sku_name="Wireless Ergonomic Keyboard",
        category="Electronics",
        current_stock=38,
        reorder_point=48,
        forecast_30day_units=120,
        weather_signal={"condition": "Rain", "temp_celsius": 18.0},
        calendar_events=[{"event_name": "Black Friday"}],
        competitor_status={"status": "stocked_out"}
    )

    assert "recommended_qty" in result
    assert "reasoning" in result
    assert "confidence_score" in result
    assert result["confidence_score"] == 0.70 # Fallback confidence
    assert result["suggested_action"] in ["REORDER_URGENT", "REORDER_STANDARD", "HOLD_INVENTORY"]
    assert "rainy weather" in result["reasoning"].lower() or "black friday" in result["reasoning"].lower()

def test_cache_key_generation():
    engine = LLMReasoningEngine()
    payload1 = {"sku": "A", "stock": 10}
    payload2 = {"sku": "A", "stock": 10}
    payload3 = {"sku": "A", "stock": 20}

    key1 = engine._compute_cache_key(payload1)
    key2 = engine._compute_cache_key(payload2)
    key3 = engine._compute_cache_key(payload3)

    assert key1 == key2
    assert key1 != key3
