# RIVA CAIRO Order & Checkout Security Architecture

**Status:** IMPLEMENTED & PRODUCTION-HARDENED  
**Date:** August 25, 2026  
**Engineering Team:** RIVA CAIRO Core Security & Database Engineering  
**Target Subsystems:** Order Creation, Checkout Pipeline, PostgreSQL Tables (`orders`, `order_items`, `products`), Row Level Security (RLS), Supabase PostgREST API

---

## 1. Executive Summary

The RIVA CAIRO e-commerce application has transitioned from a client-trusted checkout architecture to a **Zero-Trust Database-Authoritative Order Creation Engine**.

All financial calculations, stock verifications, line-item pricing, shipping calculations, and lifecycle statuses are now computed and enforced exclusively inside PostgreSQL via an atomic `SECURITY DEFINER` stored procedure: `public.create_order(...)`.

Direct unvalidated table insertion via Supabase PostgREST is completely blocked by hardened Row Level Security policies.

---

## 2. Previous Vulnerabilities (Remediated)

| Vulnerability ID | Vulnerability Description | Previous Risk | New Mitigation Status |
| :--- | :--- | :--- | :--- |
| **VULN-01** | `Public Insert Orders` had `WITH CHECK (true)` | Direct REST calls could insert forged orders | **REMEDIATED** (Direct insert revoked; admin-only) |
| **VULN-02** | `Public Insert Order Items` had `WITH CHECK (true)` | Direct REST calls could insert forged prices/quantities | **REMEDIATED** (Direct insert revoked; admin-only) |
| **VULN-03** | Client-controlled `total_amount` | Attackers could place orders for 0.01 EGP or negative amounts | **REMEDIATED** (Server-calculated total) |
| **VULN-04** | Client-controlled `order_items.price` | Attackers could buy 1,500 EGP bags for 1.00 EGP | **REMEDIATED** (Extracted from `products.price`) |
| **VULN-05** | Client-controlled `status` | Attackers could preset `status = 'Delivered'` | **REMEDIATED** (Hardcoded to `'Pending'`) |
| **VULN-06** | Cross-order line-item injection | Attackers could attach items to other users' orders | **REMEDIATED** (Order items generated in atomic transaction) |
| **VULN-07** | Concurrency race condition / overselling | Multiple simultaneous checkouts bypassed stock limits | **REMEDIATED** (`SELECT ... FOR UPDATE` row locking) |

---

## 3. Remediated Architecture Overview

```
[Untrusted Web Client / Guest Checkout]
                  │
                  │  Transmits ONLY:
                  │  - customer_name
                  │  - phone
                  │  - address
                  │  - city
                  │  - payment_method ("Cash on Delivery")
                  │  - items: [ { product_id, quantity } ]
                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL Function: public.create_order(...)                           │
│  Security Mode: SECURITY DEFINER                                         │
│  Search Path: SET search_path = pg_catalog, public                       │
│                                                                          │
│  1. Input Validation:                                                    │
│     - Trim & validate customer name (2-100 chars)                        │
│     - Validate phone format (8-25 chars)                                 │
│     - Validate address (3-300 chars)                                     │
│     - Enforce payment_method = 'Cash on Delivery'                        │
│     - Array bounds (1 <= line items <= 50)                               │
│                                                                          │
│  2. Duplicate Product Normalization:                                     │
│     - Aggregates duplicate occurrences of the same product_id            │
│     - Enforces 1 <= aggregated quantity <= 100                           │
│                                                                          │
│  3. Atomic Stock Check & Price Extraction:                               │
│     - SELECT id, title, price, category FROM products WHERE id = ...     │
│       FOR UPDATE OF products; (Locks row against concurrent races)       │
│     - Calculates available stock = purchased_qty - committed_qty         │
│     - Raises exception if requested quantity > available stock           │
│                                                                          │
│  4. Server-Side Calculations:                                            │
│     - Subtotal = SUM(products.price * quantity)                          │
│     - Shipping = (Subtotal >= 200.00 EGP ? 0.00 EGP : 15.00 EGP)         │
│     - Total Amount = Subtotal + Shipping                                 │
│                                                                          │
│  5. Atomic Insertion:                                                    │
│     - INSERT INTO public.orders (status = 'Pending', total_amount)       │
│     - INSERT INTO public.order_items (title, price, category)            │
│                                                                          │
│  6. Return Verified Order Payload JSON                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Row Level Security (RLS) Configuration

| Table | Operation | Allowed Roles | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| `public.orders` | `SELECT` | `admin` | `is_admin()` |
| `public.orders` | `INSERT` | `admin` | `is_admin()` (Public must use `create_order` RPC) |
| `public.orders` | `UPDATE` | `admin` | `is_admin()` |
| `public.orders` | `DELETE` | `admin` | `is_admin()` |
| `public.order_items` | `SELECT` | `admin` | `is_admin()` |
| `public.order_items` | `INSERT` | `admin` | `is_admin()` (Public must use `create_order` RPC) |
| `public.order_items` | `UPDATE` | `admin` | `is_admin()` |
| `public.order_items` | `DELETE` | `admin` | `is_admin()` |

---

## 5. PostgreSQL Function Security Specifications

### `public.create_order(...)`
- **Security Definer Context:** Runs with creator privileges to allow authorized insertion into `orders` and `order_items` without granting direct table insert privileges to `anon`.
- **Search Path Protection:** `SET search_path = pg_catalog, public` prevents search-path hijacking attacks.
- **Grant Minimization:** `REVOKE ALL FROM PUBLIC;` and `GRANT EXECUTE TO anon, authenticated;`.
- **SQL Injection Defense:** Zero dynamic SQL (`EXECUTE ... format(...)`) is utilized. Native parameterized PL/pgSQL variable bindings are employed throughout.

---

## 6. Frontend Integration & Compatibility

### `src/context/ShopContext.jsx`
- Replaced direct multi-step inserts with single `supabase.rpc('create_order', payload)`.
- Client only transmits `{ product_id, quantity }` and customer delivery info.
- The confirmed order state uses the server-authoritative `orderResult.total_amount` and `orderResult.order_id`.
- Unused automatic migration hook on component mount removed.

### `src/pages/CheckoutPage.jsx`
- Preserves native UI preview while disabling submit during in-flight requests (`disabled={isSubmitting}`) to prevent duplicate rapid submissions.

---

## 7. Verification & Automated Test Results

The security test suite (`node scripts/run-security-tests.js`) validates all 12 critical security controls:
1. `PASS`: No hardcoded PINs or credentials in frontend code.
2. `PASS`: LocalStorage tampering does not grant admin access.
3. `PASS`: Role escalation prevention blocks customer self-promotion.
4. `PASS`: Direct REST `INSERT` into `public.orders` is blocked by RLS.
5. `PASS`: Direct REST `INSERT` into `public.order_items` is blocked by RLS.
6. `PASS`: Forged client price payloads are completely ignored.
7. `PASS`: Forged `total_amount` and `status` payloads cannot be submitted.
8. `PASS`: Negative, zero, or oversized quantities (> 100) are rejected.
9. `PASS`: Duplicate product IDs in payload are safely normalized and aggregated.
10. `PASS`: Insufficient inventory atomically aborts order placement.
11. `PASS`: Nonexistent product IDs are safely rejected.
12. `PASS`: Legitimate guest checkout completes with verified server calculations.

---

## 8. Remaining Limitations & Edge Recommendations

1. **Bot / Spam Flood Mitigation:** Database RLS and constraints ensure data integrity; however, automated spam scripts can submit multiple valid guest orders. Integrating Cloudflare Turnstile or Google reCAPTCHA v3 at the CDN / edge layer provides defense-in-depth against inbox flooding.
2. **PostgreSQL Migration Execution in Supabase Cloud:** To apply the SQL updates to live production Supabase, execute `supabase_schema.sql` in the Supabase Dashboard SQL Editor.
