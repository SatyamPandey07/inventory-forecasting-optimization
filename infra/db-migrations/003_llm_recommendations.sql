-- 003_llm_recommendations.sql
-- Migration: LLM Reasoning Recommendations Table

CREATE TABLE IF NOT EXISTS llm_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response_raw TEXT NOT NULL,
    reasoning_prose TEXT NOT NULL,
    recommended_qty INT NOT NULL,
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 0.85,
    suggested_action VARCHAR(100) NOT NULL DEFAULT 'REORDER_STANDARD', -- REORDER_URGENT, REORDER_STANDARD, HOLD_INVENTORY
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_llm_rec_sku ON llm_recommendations(sku_id, created_at DESC);
