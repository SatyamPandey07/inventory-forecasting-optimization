import os
import json
import hashlib
import httpx
from typing import Dict, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("llm_reasoner")

class LLMReasoningEngine:
    """
    AI Reasoning Engine powered by Anthropic Claude API.
    Synthesizes historical demand, weather forecasts, holiday calendar events,
    competitor stockout signals, and current stock to output structured reorder reasoning.
    Includes 1-hour Redis response caching and rule-based fallback.
    """

    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

    def _compute_cache_key(self, payload: Dict[str, Any]) -> str:
        serialized = json.dumps(payload, sort_keys=True)
        return "llm_cache:" + hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    async def generate_reasoning(
        self,
        sku_name: str,
        category: str,
        current_stock: int,
        reorder_point: int,
        forecast_30day_units: int,
        weather_signal: Optional[Dict[str, Any]] = None,
        calendar_events: Optional[List[Dict[str, Any]]] = None,
        competitor_status: Optional[Dict[str, Any]] = None,
        redis_client: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Generates executive LLM reasoning and structured recommendation.
        Returns: {
            "recommended_qty": int,
            "reasoning": str,
            "confidence_score": float,
            "suggested_action": str,
            "cached": bool,
            "provider": str
        }
        """
        payload = {
            "sku_name": sku_name,
            "category": category,
            "current_stock": current_stock,
            "reorder_point": reorder_point,
            "forecast_30day_units": forecast_30day_units,
            "weather": weather_signal,
            "events": calendar_events,
            "competitor": competitor_status
        }

        cache_key = self._compute_cache_key(payload)

        # 1-Hour Redis Cache Check
        if redis_client:
            try:
                cached_bytes = redis_client.get(cache_key)
                if cached_bytes:
                    cached_data = json.loads(cached_bytes.decode('utf-8'))
                    cached_data["cached"] = True
                    return cached_data
            except Exception:
                pass

        # Build Multi-Signal Prompt
        prompt = (
            f"You are a Chief Supply Chain Officer. Analyze this multi-signal inventory state:\n"
            f"- SKU: {sku_name} ({category})\n"
            f"- Current Stock: {current_stock} units\n"
            f"- Reorder Threshold: {reorder_point} units\n"
            f"- 30-Day Forecast Demand: {forecast_30day_units} units\n"
            f"- Weather Forecast: {json.dumps(weather_signal or {})}\n"
            f"- Upcoming Calendar Events: {json.dumps(calendar_events or [])}\n"
            f"- Competitor Activity: {json.dumps(competitor_status or {})}\n\n"
            f"Respond ONLY with a valid JSON object matching format:\n"
            f"{{\n"
            f'  "recommended_qty": <int>,\n'
            f'  "reasoning": "<2-3 sentence executive explanation in prose>",\n'
            f'  "confidence_score": <float between 0.70 and 0.99>,\n'
            f'  "suggested_action": "<REORDER_URGENT | REORDER_STANDARD | HOLD_INVENTORY>"\n'
            f"}}\n"
        )

        result = None
        if self.anthropic_key:
            try:
                import anthropic
                client = anthropic.AsyncAnthropic(api_key=self.anthropic_key)
                message = await client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=300,
                    messages=[{"role": "user", "content": prompt}]
                )
                response_text = message.content[0].text
                parsed = json.loads(response_text)
                result = {
                    "recommended_qty": int(parsed.get("recommended_qty", forecast_30day_units)),
                    "reasoning": str(parsed.get("reasoning", "")),
                    "confidence_score": float(parsed.get("confidence_score", 0.92)),
                    "suggested_action": str(parsed.get("suggested_action", "REORDER_STANDARD")),
                    "cached": False,
                    "provider": "Anthropic Claude API"
                }
            except Exception as e:
                logger.warning(f"Claude API execution failed: {e}. Executing rule-based fallback.")

        # Fallback Engine if Claude API fails or key is unconfigured
        if not result:
            result = self._rule_based_fallback(
                sku_name, current_stock, reorder_point, forecast_30day_units,
                weather_signal, calendar_events, competitor_status
            )

        # Store in Redis Cache for 1 Hour (3600s)
        if redis_client and result:
            try:
                redis_client.setex(cache_key, 3600, json.dumps(result))
            except Exception:
                pass

        return result

    def _rule_based_fallback(
        self,
        sku_name: str,
        current_stock: int,
        reorder_point: int,
        forecast_30day_units: int,
        weather: Optional[Dict[str, Any]],
        events: Optional[List[Dict[str, Any]]],
        competitor: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analytical fallback returning forecast-based recommendations with lower confidence."""
        base_reorder = max(50, int(forecast_30day_units * 1.1))
        
        # Apply external signal multipliers
        signal_reasons = []
        if weather and "rain" in str(weather).lower():
            base_reorder = int(base_reorder * 1.15)
            signal_reasons.append("rainy weather forecast demand surge (+15%)")
        if events and any("Black Friday" in str(e) for e in events):
            base_reorder = int(base_reorder * 1.25)
            signal_reasons.append("Q4 Black Friday promotional surge (+25%)")
        if competitor and competitor.get("status") == "stocked_out":
            base_reorder = int(base_reorder * 1.20)
            signal_reasons.append("competitor stockout capture (+20%)")

        if current_stock < reorder_point:
            action = "REORDER_URGENT" if current_stock < (reorder_point * 0.5) else "REORDER_STANDARD"
            reason_text = (
                f"[FALLBACK MODEL] Inventory for {sku_name} ({current_stock} units) is below reorder point ({reorder_point} units). "
                f"Reordering {base_reorder} units is recommended to absorb 30-day forecast demand ({forecast_30day_units} units)."
            )
            if signal_reasons:
                reason_text += f" Adjusted for: {', '.join(signal_reasons)}."
        else:
            action = "HOLD_INVENTORY"
            reason_text = f"[FALLBACK MODEL] Current inventory for {sku_name} ({current_stock} units) is healthy above reorder threshold ({reorder_point} units)."
            base_reorder = 0

        return {
            "recommended_qty": base_reorder,
            "reasoning": reason_text,
            "confidence_score": 0.70, # Lower confidence for analytical fallback
            "suggested_action": action,
            "cached": False,
            "provider": "Rule-Based Analytical Fallback"
        }
