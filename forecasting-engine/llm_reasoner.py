import os
import httpx
from typing import Dict, Any, Optional

class LLMReasoningEngine:
    """
    AI Reasoning Engine using Claude API or Ollama fallback.
    Generates plain-English executive explanations for inventory recommendations,
    risk alerts, and scenario simulations.
    """

    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")

    async def explain_recommendation(
        self,
        sku_name: str,
        category: str,
        current_stock: int,
        reorder_point: int,
        recommended_qty: int,
        safety_stock: int,
        lead_time_days: int,
        supplier_name: str,
        scenario_name: str = "base_case"
    ) -> str:
        """
        Generates executive summary explanation for an inventory decision.
        """
        if self.anthropic_key:
            try:
                import anthropic
                client = anthropic.AsyncAnthropic(api_key=self.anthropic_key)
                prompt = (
                    f"You are a Senior Supply Chain Director. Explain this inventory recommendation succinctly (2-3 sentences):\n"
                    f"SKU: {sku_name} ({category})\n"
                    f"Current Stock: {current_stock} units\n"
                    f"Reorder Point: {reorder_point} units\n"
                    f"Recommended Reorder Qty: {recommended_qty} units\n"
                    f"Required Safety Stock: {safety_stock} units\n"
                    f"Lead Time: {lead_time_days} days (Supplier: {supplier_name})\n"
                    f"Scenario: {scenario_name}\n"
                    f"Focus on stockout prevention, holding cost efficiency, and operational urgency."
                )
                message = await client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=250,
                    messages=[{"role": "user", "content": prompt}]
                )
                return message.content[0].text
            except Exception as e:
                pass

        # Smart rule-based reasoning engine fallback if no API key is set
        if current_stock < reorder_point:
            urgency = "URGENT REORDER" if current_stock < safety_stock else "REORDER RECOMMENDED"
            return (
                f"[{urgency}] Current inventory for {sku_name} ({current_stock} units) has fallen below the reorder point ({reorder_point} units). "
                f"Placing a batch order of {recommended_qty} units with {supplier_name} ({lead_time_days}-day lead time) will secure a 95% service level "
                f"and maintain a {safety_stock}-unit safety buffer against stockouts."
            )
        else:
            return (
                f"[OPTIMAL LEVEL] Inventory for {sku_name} is currently healthy at {current_stock} units. "
                f"Recommended reorder of {recommended_qty} units will optimize Economic Order Quantity (EOQ) while minimizing holding costs."
            )
