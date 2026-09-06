-- ============================================================
-- RIVA CAIRO — Recovery Point Migration
-- Run this in your Supabase SQL Editor ONCE
-- ============================================================

-- 1. Extend the orders status constraint to allow 'Returned'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_orders_valid_status;
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_valid_status
    CHECK (status IN ('Pending', 'Processing', 'Delivered', 'Cancelled', 'Returned'));

-- 2. Create the order_returns table
CREATE TABLE IF NOT EXISTS public.order_returns (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID         NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    returned_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    note          TEXT         DEFAULT '',
    created_by    TEXT         DEFAULT 'admin',
    CONSTRAINT uq_order_returns_order_id UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS idx_order_returns_order_id    ON public.order_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_returned_at ON public.order_returns(returned_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.order_returns ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — Admin-only
DROP POLICY IF EXISTS "Admin Read Order Returns"   ON public.order_returns;
DROP POLICY IF EXISTS "Admin Insert Order Returns" ON public.order_returns;
DROP POLICY IF EXISTS "Admin Update Order Returns" ON public.order_returns;
DROP POLICY IF EXISTS "Admin Delete Order Returns" ON public.order_returns;

CREATE POLICY "Admin Read Order Returns"
    ON public.order_returns FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin Insert Order Returns"
    ON public.order_returns FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin Update Order Returns"
    ON public.order_returns FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admin Delete Order Returns"
    ON public.order_returns FOR DELETE
    USING (public.is_admin());
