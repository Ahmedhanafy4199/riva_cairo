-- ============================================================
-- RIVA CAIRO SUPABASE HARDENED DATABASE & STORAGE SCHEMA
-- Production-Grade Security Hardening & Auth Migration
-- ============================================================


-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (User Roles & Auth Metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on role for fast authorization lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Secure Function to check if current authenticated user is an Admin
-- SECURITY DEFINER ensures it runs with owner privileges to safely query public.profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'customer')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    barcode TEXT UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    purchased_qty INTEGER DEFAULT 0,
    sold INTEGER NOT NULL DEFAULT 0,
    qty_stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory counters are database-derived from order history.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS qty_stock INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_sold_non_negative') THEN
        ALTER TABLE public.products ADD CONSTRAINT chk_products_sold_non_negative CHECK (sold >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_qty_stock_non_negative') THEN
        ALTER TABLE public.products ADD CONSTRAINT chk_products_qty_stock_non_negative CHECK (qty_stock >= 0);
    END IF;
END $$;

-- Ensure barcode is unique if table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_barcode_key'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT products_barcode_key UNIQUE (barcode);
    END IF;
END $$;

-- 6. Create Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 7. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Recalculate inventory counters from authoritative order rows.
CREATE OR REPLACE FUNCTION public.refresh_product_inventory(p_product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    UPDATE public.products AS p
    SET
          sold = COALESCE((
            SELECT SUM(oi.quantity)
            FROM public.order_items AS oi
            JOIN public.orders AS o ON o.id = oi.order_id
            WHERE oi.product_id = p.id
              AND o.status IN ('Pending', 'Processing', 'Delivered')
        ), 0),
        qty_stock = GREATEST(0, COALESCE(p.purchased_qty, 0) - COALESCE((
            SELECT SUM(oi.quantity)
            FROM public.order_items AS oi
            JOIN public.orders AS o ON o.id = oi.order_id
            WHERE oi.product_id = p.id
              AND o.status IN ('Pending', 'Processing', 'Delivered')
        ), 0)),
        updated_at = NOW()
    WHERE p.id = p_product_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_product_inventory(UUID) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.sync_product_inventory_from_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    affected_product_id UUID;
BEGIN
    IF TG_TABLE_NAME = 'products' THEN
        PERFORM public.refresh_product_inventory(NEW.id);
    ELSIF TG_TABLE_NAME = 'order_items' THEN
        IF TG_OP <> 'DELETE' THEN
            PERFORM public.refresh_product_inventory(NEW.product_id);
        END IF;
        IF TG_OP <> 'INSERT' AND OLD.product_id IS DISTINCT FROM NEW.product_id THEN
            PERFORM public.refresh_product_inventory(OLD.product_id);
        END IF;
    ELSE
        FOR affected_product_id IN
            SELECT DISTINCT oi.product_id
            FROM public.order_items AS oi
            WHERE oi.order_id = COALESCE(NEW.id, OLD.id)
              AND oi.product_id IS NOT NULL
        LOOP
            PERFORM public.refresh_product_inventory(affected_product_id);
        END LOOP;
    END IF;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_product_inventory_from_order() FROM PUBLIC;

DROP TRIGGER IF EXISTS sync_product_inventory_after_order_item ON public.order_items;
CREATE TRIGGER sync_product_inventory_after_order_item
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION public.sync_product_inventory_from_order();

DROP TRIGGER IF EXISTS sync_product_inventory_after_order_status ON public.orders;
CREATE TRIGGER sync_product_inventory_after_order_status
    AFTER UPDATE OF status OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.sync_product_inventory_from_order();

DROP TRIGGER IF EXISTS sync_product_inventory_after_product_change ON public.products;
CREATE TRIGGER sync_product_inventory_after_product_change
    AFTER INSERT OR UPDATE OF purchased_qty ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.sync_product_inventory_from_order();

-- Backfill counters when this migration is applied to an existing database.
UPDATE public.products AS p
SET
    sold = COALESCE((
        SELECT SUM(oi.quantity)
        FROM public.order_items AS oi
        JOIN public.orders AS o ON o.id = oi.order_id
        WHERE oi.product_id = p.id
          AND o.status IN ('Pending', 'Processing', 'Delivered')
    ), 0),
    qty_stock = GREATEST(0, COALESCE(p.purchased_qty, 0) - COALESCE((
        SELECT SUM(oi.quantity)
        FROM public.order_items AS oi
        JOIN public.orders AS o ON o.id = oi.order_id
        WHERE oi.product_id = p.id
          AND o.status IN ('Pending', 'Processing', 'Delivered')
    ), 0));

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — HARDENED PRODUCTION RULES
-- ============================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

-- Anyone authenticated can view their own profile; Admins can view all profiles
CREATE POLICY "Profiles select policy" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- System / trigger handles insertion, or user inserting own profile as 'customer'
CREATE POLICY "Profiles insert policy" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id AND role = 'customer');

-- Only Admins can update roles; Users can update own profile ONLY if role remains 'customer'
CREATE POLICY "Profiles update policy" ON public.profiles
    FOR UPDATE USING (
        public.is_admin() OR (auth.uid() = id AND role = 'customer')
    );

-- Only Admins can delete profile rows
CREATE POLICY "Profiles delete policy" ON public.profiles
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- PRODUCTS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Insert Products" ON public.products;
DROP POLICY IF EXISTS "Public Update Products" ON public.products;
DROP POLICY IF EXISTS "Public Delete Products" ON public.products;
DROP POLICY IF EXISTS "Admin Read Products" ON public.products;
DROP POLICY IF EXISTS "Admin Insert Products" ON public.products;
DROP POLICY IF EXISTS "Admin Update Products" ON public.products;
DROP POLICY IF EXISTS "Admin Delete Products" ON public.products;

CREATE POLICY "Public Read Products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admin Insert Products" ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Update Products" ON public.products
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Delete Products" ON public.products
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- PRODUCT IMAGES POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Public Insert Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Public Update Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Public Delete Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Admin Read Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Admin Insert Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Admin Update Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Admin Delete Product Images" ON public.product_images;

CREATE POLICY "Public Read Product Images" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Admin Insert Product Images" ON public.product_images
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Update Product Images" ON public.product_images
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Delete Product Images" ON public.product_images
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- ORDERS & ORDER ITEMS INTEGRITY CONSTRAINTS
-- ------------------------------------------------------------
DO $$
BEGIN
    -- Orders constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_total_positive') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_total_positive CHECK (total_amount >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_valid_status') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_valid_status 
            CHECK (status IN ('Pending', 'Processing', 'Delivered', 'Cancelled'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_name_not_empty') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_name_not_empty 
            CHECK (length(trim(customer_name)) >= 2 AND length(trim(customer_name)) <= 100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_phone_not_empty') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_phone_not_empty 
            CHECK (length(trim(phone)) >= 8 AND length(trim(phone)) <= 25);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_payment_method') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_payment_method 
            CHECK (payment_method IN ('Cash on Delivery'));
    END IF;

    -- Order items constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_price_non_negative') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_price_non_negative CHECK (price >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_quantity_range') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_quantity_range 
            CHECK (quantity >= 1 AND quantity <= 100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_title_not_empty') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_title_not_empty 
            CHECK (length(trim(title)) > 0);
    END IF;
END $$;

-- ------------------------------------------------------------
-- ORDERS POLICIES (HARDENED - ZERO UNVALIDATED PUBLIC INSERTS)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Delete Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Delete Orders" ON public.orders;

-- Direct table operations on orders are restricted to Admins
CREATE POLICY "Admin Read Orders" ON public.orders
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin Insert Orders" ON public.orders
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Update Orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Delete Orders" ON public.orders
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- ORDER ITEMS POLICIES (HARDENED - ZERO UNVALIDATED PUBLIC INSERTS)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Insert Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Update Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Delete Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Admin Read Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Admin Insert Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Admin Update Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Admin Delete Order Items" ON public.order_items;

-- Direct table operations on order_items are restricted to Admins
CREATE POLICY "Admin Read Order Items" ON public.order_items
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin Insert Order Items" ON public.order_items
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Update Order Items" ON public.order_items
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Delete Order Items" ON public.order_items
    FOR DELETE USING (public.is_admin());

-- ============================================================
-- ATOMIC & AUTHORITATIVE ORDER CREATION RPC (ZERO CLIENT TRUST)
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order(
    p_customer_name TEXT,
    p_phone TEXT,
    p_address TEXT,
    p_city TEXT DEFAULT '',
    p_payment_method TEXT DEFAULT 'Cash on Delivery',
    p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_order_id UUID := gen_random_uuid();
    v_item RECORD;
    v_product RECORD;
    v_subtotal NUMERIC(10, 2) := 0.00;
    v_shipping NUMERIC(10, 2) := 0.00;
    v_total_amount NUMERIC(10, 2) := 0.00;
    v_item_count INTEGER := 0;
    v_clean_name TEXT;
    v_clean_phone TEXT;
    v_clean_address TEXT;
    v_clean_city TEXT;
    v_clean_payment TEXT;
    v_available_stock INTEGER;
    v_committed_qty INTEGER;
BEGIN
    -- 1. Sanitize & Validate Customer Fields
    v_clean_name := trim(p_customer_name);
    v_clean_phone := trim(p_phone);
    v_clean_address := trim(p_address);
    v_clean_city := COALESCE(trim(p_city), '');
    v_clean_payment := COALESCE(trim(p_payment_method), 'Cash on Delivery');

    IF v_clean_name IS NULL OR length(v_clean_name) < 2 OR length(v_clean_name) > 100 THEN
        RAISE EXCEPTION 'Invalid customer name. Must be between 2 and 100 characters.';
    END IF;

    IF v_clean_phone IS NULL OR length(v_clean_phone) < 8 OR length(v_clean_phone) > 25 THEN
        RAISE EXCEPTION 'Invalid phone number. Must be between 8 and 25 characters.';
    END IF;

    IF v_clean_address IS NULL OR length(v_clean_address) < 3 OR length(v_clean_address) > 300 THEN
        RAISE EXCEPTION 'Invalid delivery address. Must be between 3 and 300 characters.';
    END IF;

    IF length(v_clean_city) > 100 THEN
        RAISE EXCEPTION 'City name exceeds maximum allowed length of 100 characters.';
    END IF;

    IF v_clean_payment <> 'Cash on Delivery' THEN
        RAISE EXCEPTION 'Unsupported payment method: %. Only Cash on Delivery is accepted.', v_clean_payment;
    END IF;

    -- 2. Validate Items Array
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one product item.';
    END IF;

    IF jsonb_array_length(p_items) > 50 THEN
        RAISE EXCEPTION 'Order item limit exceeded (Maximum 50 line items allowed).';
    END IF;

    -- 3. Temporary table to normalize and aggregate duplicate product_ids
    CREATE TEMPORARY TABLE temp_order_items (
        product_id UUID PRIMARY KEY,
        quantity INTEGER NOT NULL,
        title TEXT,
        price NUMERIC(10, 2),
        category TEXT
    ) ON COMMIT DROP;

    -- Insert aggregated items into temp table
    BEGIN
        INSERT INTO temp_order_items (product_id, quantity)
        SELECT 
            (elem->>'product_id')::UUID AS product_id,
            SUM((elem->>'quantity')::INTEGER) AS quantity
        FROM jsonb_array_elements(p_items) AS elem
        WHERE (elem->>'product_id') IS NOT NULL
        GROUP BY (elem->>'product_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Malformed order items payload. Please provide valid product_id and quantity values.';
    END;

    IF (SELECT COUNT(*) FROM temp_order_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one valid product item.';
    END IF;

    -- 4. Process Each Item: Lock row, Verify Stock, Read Authoritative Data
    FOR v_item IN SELECT product_id, quantity FROM temp_order_items
    LOOP
        IF v_item.quantity < 1 OR v_item.quantity > 100 THEN
            RAISE EXCEPTION 'Invalid total quantity for product %: must be between 1 and 100.', v_item.product_id;
        END IF;

        -- Lock product row exclusively to serialize concurrent checkouts
        SELECT 
            p.id, 
            p.title, 
            p.price, 
            p.category, 
            COALESCE(p.purchased_qty, 0) AS purchased_qty
        INTO v_product
        FROM public.products p
        WHERE p.id = v_item.product_id
        FOR UPDATE OF p;

        IF v_product.id IS NULL THEN
            RAISE EXCEPTION 'Product with ID % does not exist or is no longer available.', v_item.product_id;
        END IF;

        -- Calculate committed quantity from non-cancelled orders
        SELECT COALESCE(SUM(oi.quantity), 0)
        INTO v_committed_qty
        FROM public.order_items oi
        JOIN public.orders o ON oi.order_id = o.id
        WHERE oi.product_id = v_item.product_id
          AND o.status IN ('Pending', 'Processing', 'Delivered');

        v_available_stock := GREATEST(0, v_product.purchased_qty - v_committed_qty);

        IF v_item.quantity > v_available_stock THEN
            RAISE EXCEPTION 'Insufficient stock for "%" (Requested: %, Available: %)', 
                v_product.title, v_item.quantity, v_available_stock;
        END IF;

        -- Update temp table with authoritative product details
        UPDATE temp_order_items
        SET 
            title = v_product.title,
            price = v_product.price,
            category = COALESCE(v_product.category, '')
        WHERE product_id = v_item.product_id;

        -- Accumulate subtotal
        v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
        v_item_count := v_item_count + v_item.quantity;
    END LOOP;

    -- 5. Server-Side Shipping Calculation
    -- Business rule: Orders >= 200 EGP qualify for FREE delivery, otherwise 15 EGP
    IF v_subtotal >= 200.00 THEN
        v_shipping := 0.00;
    ELSE
        v_shipping := 15.00;
    END IF;

    v_total_amount := v_subtotal + v_shipping;

    -- 6. Insert Order Record (Strictly Pending status and server-calculated total)
    INSERT INTO public.orders (
        id,
        customer_name,
        phone,
        address,
        city,
        total_amount,
        payment_method,
        status,
        created_at
    ) VALUES (
        v_order_id,
        v_clean_name,
        v_clean_phone,
        v_clean_address,
        v_clean_city,
        v_total_amount,
        v_clean_payment,
        'Pending',
        NOW()
    );

    -- 7. Insert Order Items Records
    INSERT INTO public.order_items (
        order_id,
        product_id,
        title,
        price,
        quantity,
        category,
        created_at
    )
    SELECT 
        v_order_id,
        product_id,
        title,
        price,
        quantity,
        category,
        NOW()
    FROM temp_order_items;

    -- 8. Return Authoritative Order Payload
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'status', 'Pending',
        'subtotal', v_subtotal,
        'shipping', v_shipping,
        'total_amount', v_total_amount,
        'item_count', v_item_count,
        'customer_name', v_clean_name,
        'phone', v_clean_phone,
        'address', v_clean_address,
        'city', v_clean_city,
        'payment_method', v_clean_payment,
        'created_at', NOW()
    );
END;
$$;

-- Revoke all permissions from PUBLIC and grant solely to anon and authenticated
REVOKE ALL ON FUNCTION public.create_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

-- ============================================================
-- STORAGE BUCKET HARDENING FOR PRODUCT IMAGES
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/bmp', 'image/tiff']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/bmp', 'image/tiff'];

-- Drop legacy permissive storage policies
DROP POLICY IF EXISTS "Public Access Storage Product Images Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Storage Product Images Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Storage Product Images Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Storage Product Images Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Access Storage Product Images Read" ON storage.objects;
DROP POLICY IF EXISTS "Admin Access Storage Product Images Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Access Storage Product Images Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Access Storage Product Images Delete" ON storage.objects;

-- Storage RLS Policies
CREATE POLICY "Public Access Storage Product Images Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin Access Storage Product Images Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin Access Storage Product Images Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin Access Storage Product Images Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.is_admin());

-- ============================================================
-- ADMIN PROVISIONING SCRIPT EXAMPLE
-- ============================================================
-- To promote an existing user to Admin in Supabase:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@rivacairo.com';
-- ============================================================

