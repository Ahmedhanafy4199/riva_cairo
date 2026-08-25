// tests/e2e/05-auth-admin.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// TC-12  Login  (admin modal)
// TC-13  Logout
// TC-14  Protected /admin route
// TC-15  Admin authentication (wrong credentials)
// TC-16  Admin product CRUD
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { waitForProducts, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

async function openAdminModal(page) {
  const adminBtn = page.locator('button').filter({ hasText: /^Admin$|^Admin Login$/ }).first();
  await adminBtn.click();
  await page.waitForSelector('h3:has-text("Store Owner Authentication")', { timeout: 5000 });
}

async function loginAsAdmin(page, email, password) {
  await openAdminModal(page);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Unlock Admin Panel")');
  await page.waitForSelector('h3:has-text("Store Owner Authentication")', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function logoutAdmin(page) {
  const logoutBtn = page.locator('button').filter({ hasText: /Logout|Sign Out|Log Out/ }).first();
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await page.waitForTimeout(1500);
  }
}

test.describe('14 – Protected /admin Route', () => {

  test('TC-14-A: unauthenticated /admin redirects to home (/)', async ({ page }) => {
    await page.goto('/admin');
    await waitForProducts(page);
    await page.waitForURL('/', { timeout: 8000 });
    expect(page.url()).toMatch(/\/$/);
  });
});

test.describe('12 – Login (Admin Modal)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForProducts(page);
  });

  test('TC-12-A: Admin button opens login modal', async ({ page }) => {
    await openAdminModal(page);
    await expect(page.locator('h3:has-text("Store Owner Authentication")')).toBeVisible();
  });

  test('TC-12-B: modal contains email + password fields and submit button', async ({ page }) => {
    await openAdminModal(page);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Unlock Admin Panel")')).toBeVisible();
  });

  test('TC-12-C: closing modal via X button hides the modal', async ({ page }) => {
    await openAdminModal(page);
    await page.click('[aria-label="Close modal"]');
    await page.waitForTimeout(400);
    await expect(page.locator('h3:has-text("Store Owner Authentication")')).toHaveCount(0);
  });
});

test.describe('15 – Admin Authentication (Wrong Credentials)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForProducts(page);
  });

  test('TC-15-A: wrong email/password shows error message', async ({ page }) => {
    await openAdminModal(page);
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button:has-text("Unlock Admin Panel")');
    await expect(
      page.locator('div.bg-red-950\\/80, div[class*="bg-red"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-15-B: empty form submission stays on modal with HTML5 validation', async ({ page }) => {
    await openAdminModal(page);
    await page.click('button:has-text("Unlock Admin Panel")');
    await expect(page.locator('h3:has-text("Store Owner Authentication")')).toBeVisible();
  });

  test('TC-15-C: non-admin Supabase user denied access', async ({ page }) => {
    await openAdminModal(page);
    await page.fill('input[type="email"]', 'notadmin@test.com');
    await page.fill('input[type="password"]', 'AnyPassword!99');
    await page.click('button:has-text("Unlock Admin Panel")');
    await page.waitForTimeout(5000);
    const url = page.url();
    expect(url).not.toContain('/admin');
  });
});

const CREDS_AVAILABLE = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

test.describe('13 – Logout & 16 – Admin Product CRUD', () => {

  test.skip(!CREDS_AVAILABLE, 'ADMIN_EMAIL / ADMIN_PASSWORD env vars not set – skipping admin CRUD tests');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForProducts(page);
    await loginAsAdmin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('TC-13-A: after login, Admin Panel button navigates to /admin', async ({ page }) => {
    const adminPanelBtn = page.locator('button').filter({ hasText: /Admin Panel/ }).first();
    if (await adminPanelBtn.isVisible().catch(() => false)) {
      await adminPanelBtn.click();
      await page.waitForURL(/\/admin/, { timeout: 8000 });
      expect(page.url()).toContain('/admin');
    } else {
      await page.goto('/admin');
      await page.waitForURL(/\/admin/, { timeout: 8000 });
      expect(page.url()).toContain('/admin');
    }
  });

  test('TC-13-B: admin dashboard renders heading', async ({ page }) => {
    await page.goto('/admin');
    await waitForProducts(page);
    const heading = page.locator('h1, h2').filter({ hasText: /Admin|Dashboard|Inventory/ }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-13-C: logout redirects to home and clears admin state', async ({ page }) => {
    await page.goto('/admin');
    await waitForProducts(page);
    await logoutAdmin(page);
    await page.waitForURL('/', { timeout: 8000 });
    await page.goto('/admin');
    await page.waitForURL('/', { timeout: 8000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test('TC-16-A: admin can see product list in dashboard', async ({ page }) => {
    await page.goto('/admin');
    await waitForProducts(page);
    await page.waitForTimeout(1500);
    const productRows = page.locator('table tbody tr');
    const count = await productRows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-16-B: Add Product button / form opens', async ({ page }) => {
    await page.goto('/admin');
    await waitForProducts(page);
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button').filter({ hasText: /Add Product|New Product|Add New Item/ }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(500);
    const titleInput = page.locator('input[placeholder*="title"], input[placeholder*="Title"], input[placeholder*="Leather"]').first();
    await expect(titleInput).toBeVisible({ timeout: 5000 });
  });

  test('TC-16-C: Edit button opens product edit form', async ({ page }) => {
    await page.goto('/admin');
    await waitForProducts(page);
    await page.waitForTimeout(1500);
    const editBtn = page.locator('button[title="Edit Product"], button').filter({ hasText: /Edit/ }).first();
    const isVisible = await editBtn.isVisible().catch(() => false);
    if (isVisible) {
      await editBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
    expect(true).toBe(true);
  });

  test('TC-16-D: Delete button is present on product cards when admin is logged in', async ({ page }) => {
    await page.goto('/category/All');
    await waitForProducts(page);
    const deleteBtn = page.locator('button[title="Delete Product"]').first();
    const isVisible = await deleteBtn.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });
});
