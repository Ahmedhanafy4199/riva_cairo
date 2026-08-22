-- ============================================================
-- RIVA CAIRO SUPABASE HARDENED DATABASE & STORAGE SCHEMA
-- Production-Grade Security Hardening & Auth Migration
-- ============================================================
-- Execute this script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
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
    featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE POLICY "Public Read Product Images" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Admin Insert Product Images" ON public.product_images
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Update Product Images" ON public.product_images
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Delete Product Images" ON public.product_images
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- ORDERS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Delete Orders" ON public.orders;

-- Only Admins can view orders
CREATE POLICY "Admin Read Orders" ON public.orders
    FOR SELECT USING (public.is_admin());

-- Anonymous/Guest customers can create (place) orders during checkout
CREATE POLICY "Public Insert Orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Only Admins can update order status
CREATE POLICY "Admin Update Orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

-- Only Admins can delete orders
CREATE POLICY "Admin Delete Orders" ON public.orders
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- ORDER ITEMS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Insert Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Update Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Delete Order Items" ON public.order_items;

-- Only Admins can view order items
CREATE POLICY "Admin Read Order Items" ON public.order_items
    FOR SELECT USING (public.is_admin());

-- Anonymous/Guest customers can insert order items when placing an order
CREATE POLICY "Public Insert Order Items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Only Admins can update order items
CREATE POLICY "Admin Update Order Items" ON public.order_items
    FOR UPDATE USING (public.is_admin());

-- Only Admins can delete order items
CREATE POLICY "Admin Delete Order Items" ON public.order_items
    FOR DELETE USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKET HARDENING FOR PRODUCT IMAGES
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif', 'image/bmp', 'image/tiff']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif', 'image/bmp', 'image/tiff'];

-- Drop legacy permissive storage policies
DROP POLICY IF EXISTS "Public Access Storage Product Images Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Storage Product Images Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Storage Product Images Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Storage Product Images Delete" ON storage.objects;

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
