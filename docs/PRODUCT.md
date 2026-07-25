# InventoryAI — Product Walkthrough & Business Guide

**InventoryAI** empowers retail supply chain directors and operations managers to eliminate stockout lost sales, minimize warehouse holding capital, and automate reorder decision-making using open-source machine learning and generative AI.

---

## 🎯 Business Problems Solved

1. **Stockout Prevention**: Identifies SKUs approaching critical reorder points weeks in advance, taking supplier lead times and weather events into account.
2. **Capital Efficiency**: Replaces static rule-of-thumb order sizes with Economic Order Quantity (EOQ) optimization that minimizes carrying costs against stockout risk penalties.
3. **Executive Decision Clarity**: Translates complex statistical forecasts into plain-English prose recommendations powered by Anthropic Claude LLM reasoning.
4. **Disruption Preparedness**: Simulates "What-If" scenarios (e.g. 50% demand spikes, supplier port delays) via 1,000 Monte Carlo trial runs.

---

## 🚀 Key User Workflows

### 1. Executive Control Tower (`/`)
- View real-time inventory levels across all active SKUs.
- Monitor 30-day sales volume and revenue.
- Identify stockout risk alerts requiring immediate reorder action.

### 2. AI Reorders & Recommendations (`/recommendations`)
- Review autonomous EOQ reorder recommendations.
- Inspect expected financial cost savings (e.g. $1,850 saved by avoiding stockout penalties).
- Read Claude LLM executive reasoning explaining weather, holiday, and lead time factors.
- Click **Accept & Log Decision** to trigger supplier purchase orders.

### 3. What-If Scenario Simulator (`/simulator`)
- Adjust sliders for supplier lead time delays (+7 days) and demand surges (+25%).
- Run 1,000 Monte Carlo simulations to plot 90-day cost outcome distribution histograms and risk percentiles (p10, p50, p90, p95).

### 4. Supplier Performance Scorecard (`/suppliers`)
- Track on-time delivery percentages, quality defect counts, and lead time variance across suppliers.
- Log supplier feedback (late delivery, damaged items) to dynamically update safety stock buffers.
