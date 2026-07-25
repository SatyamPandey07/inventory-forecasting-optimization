-- 004_continuous_learning.sql
-- Migration: Continuous Learning, Supplier Feedback, A/B Testing & Audit Logs

CREATE TABLE IF NOT EXISTS supplier_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    feedback_type VARCHAR(100) NOT NULL, -- late_delivery, quality_defect, damaged_shipment, price_increase
    description TEXT,
    delay_days INT DEFAULT 0,
    quality_score_impact NUMERIC(4, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_test_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    algo_choice JSONB NOT NULL,
    llm_choice JSONB NOT NULL,
    chosen_option VARCHAR(50) DEFAULT 'pending', -- algo, llm, rejected, pending
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_cost_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_month DATE NOT NULL,
    total_carrying_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_stockout_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_order_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    roi_savings NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_org_month UNIQUE (org_id, report_month)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_feedback_supplier ON supplier_feedback(supplier_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(org_id, created_at DESC);
