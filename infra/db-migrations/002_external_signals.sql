-- 002_external_signals.sql
-- Migration: External Signals (Calendar Events & Competitor Prices)

CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100) NOT NULL DEFAULT 'holiday', -- holiday, promotion, season, conference
    country_code VARCHAR(10) NOT NULL DEFAULT 'US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) NOT NULL DEFAULT 'manual_entry' -- manual_entry, brightdata_scraper, api_feed
);

-- Index for fast lookup by date and SKU
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_sku ON competitor_prices(sku_id, recorded_at DESC);
