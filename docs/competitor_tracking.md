# Competitor Price Tracking Architecture & Cost Specification

This document details the architectural requirements, scaling strategy, and cost structures for integrating enterprise competitor price intelligence into **InventoryAI**.

---

## 1. Challenges of Competitor Price Scraping
Automated competitor price tracking across major retail platforms (Amazon, Walmart, Target, Best Buy) presents several technical barriers:
1. **Anti-Bot & CAPTCHA Enforcement:** Cloudflare, Akamai, and DataDome block standard HTTP crawlers.
2. **Dynamic DOM Rendering:** Single Page Applications (React/Vue) render prices client-side via JavaScript.
3. **Geo-Location Price Variance:** Retailers display regional price variations depending on user IP location.

---

## 2. Recommended Solution: Bright Data Integration

To scale competitor price scraping without managing custom proxy infrastructure:

```text
[ InventoryAI API ]
        │
        ▼
[ Bright Data Web Unlocker / SERP API ]
        │ (Residential IP Proxy Network + Anti-CAPTCHA Auto-Bypass)
        ▼
[ Target Competitor E-Commerce Sites ] (Amazon, Walmart, Target)
        │
        ▼ Parsed HTML / JSON Price Payload
[ CompetitorPrices Table ] (PostgreSQL)
```

### Key Components
1. **Bright Data Web Unlocker:** Automatically solves CAPTCHAs, manages user-agent rotation, and executes headless Chrome rendering.
2. **SERP API:** Directly retrieves structured product search results and pricing schemas without parsing raw HTML.

---

## 3. Cost Implications & Pricing Breakdown

| Volume Tier | Scraped Pages / Month | Bright Data Service Tier | Estimated Monthly Cost |
|---|---|---|---|
| **Starter / Micro** | 10,000 requests | Pay-as-you-go ($1.50 / 1K requests) | **~$15.00 / month** |
| **Growth SaaS** | 100,000 requests | Micro Plan | **~$120.00 / month** |
| **Enterprise SaaS** | 1,000,000 requests | Growth Plan | **~$500 - $850 / month** |

---

## 4. Current Manual Entry & API Ingestion
Currently, InventoryAI provides a lightweight manual entry and webhook endpoint (`POST /signals/competitor`) allowing users or custom scrapers to push pricing data directly into the system.
