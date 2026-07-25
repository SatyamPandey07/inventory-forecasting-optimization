-- 001_initial_schema.sql
-- InventoryAI PostgreSQL + TimescaleDB Migration

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. Core Relational Tables
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'pro',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reorder_point INT NOT NULL DEFAULT 50,
    safety_stock INT NOT NULL DEFAULT 20,
    economic_order_qty INT NOT NULL DEFAULT 100,
    lead_time_days INT NOT NULL DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_org_sku UNIQUE (org_id, sku_code)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    lead_time_days INT NOT NULL DEFAULT 7,
    reliability_score NUMERIC(4, 2) NOT NULL DEFAULT 0.95,
    quality_score NUMERIC(4, 2) NOT NULL DEFAULT 0.98,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    cost NUMERIC(12, 2) NOT NULL,
    min_order_qty INT NOT NULL DEFAULT 1,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TimescaleDB Hypertables
CREATE TABLE IF NOT EXISTS demand_history (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    org_id UUID NOT NULL,
    sku_id UUID NOT NULL,
    units_sold INT NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL
);
SELECT create_hypertable('demand_history', 'time', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS inventory_levels (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    org_id UUID NOT NULL,
    sku_id UUID NOT NULL,
    units_on_hand INT NOT NULL,
    units_on_order INT NOT NULL DEFAULT 0
);
SELECT create_hypertable('inventory_levels', 'time', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS weather_data (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    org_id UUID NOT NULL,
    location VARCHAR(255) NOT NULL,
    temp NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    precipitation NUMERIC(5, 2)
);
SELECT create_hypertable('weather_data', 'time', if_not_exists => TRUE);

-- 3. Forecasting & Decision Support
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    units_predicted INT NOT NULL,
    confidence_lower INT NOT NULL,
    confidence_upper INT NOT NULL,
    retraining_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    recommended_qty INT NOT NULL,
    safety_stock INT NOT NULL,
    reorder_point INT NOT NULL,
    reason TEXT NOT NULL,
    scenario VARCHAR(100) NOT NULL DEFAULT 'base_case',
    cost_impact NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.92,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE
);
