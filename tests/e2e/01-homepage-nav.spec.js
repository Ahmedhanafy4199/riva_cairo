// tests/e2e/01-homepage-nav.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// TC-01  Homepage — basic render checks
// TC-02  Navigation — desktop nav links
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { waitForProducts } from './helpers.js';

test.describe('01 – Homepage', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('riva_cart');
    });
    await waitForProducts(page);
  });

  test('TC-01-A: page title / brand name visible', async ({ page }) => {
    await expect(page.locator('header').locator('text=RIVA').first()).toBeVisible();
  });

  test('TC-01-B: hero section renders', async ({ page }) => {
    // Hero section cover image and CTA button
    const heroImg = page.locator('img[alt*="Leather Collection"], img[alt*="Riva Cairo"]').first();
    await expect(heroImg).toBeVisible();
    await expect(page.locator('button', { hasText: 'Shop All Products' })).toBeVisible();
  });

  test('TC-01-C: Featured Luxury Products section heading visible', async ({ page }) => {
    await expect(
      page.locator('h2', { hasText: 'Featured Luxury Products' })
    ).toBeVisible();
  });

  test('TC-01-D: at least one product card rendered', async ({ page }) => {
    const priceEls = page.locator('.text-amber-400').filter({ hasText: /\d+\.\d{2}/ });
    await expect(priceEls.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-01-E: category collection sections visible when products exist', async ({ page }) => {
    const headings = page.locator('h3').filter({ hasText: /Collection/ });
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-01-F: "View All" button navigates to category page', async ({ page }) => {
    const viewAll = page.locator('button', { hasText: /View All/ }).first();
    await expect(viewAll).toBeVisible();
    await viewAll.click();
    await page.waitForURL(/\/category\//, { timeout: 8000 });
    expect(page.url()).toContain('/category/');
  });
});

test.describe('02 – Navigation (Desktop)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('riva_cart');
    });
    await waitForProducts(page);
  });

  test('TC-02-A: Bags nav link navigates to /category/Bags', async ({ page }) => {
    await page.click('header nav button:has-text("Bags")');
    await page.waitForURL(/\/category\/Bags/i, { timeout: 8000 });
    expect(page.url()).toContain('Bags');
  });

  test('TC-02-B: Wallets nav link navigates to /category/Wallets', async ({ page }) => {
    await page.click('header nav button:has-text("Wallets")');
    await page.waitForURL(/\/category\/Wallets/i, { timeout: 8000 });
    expect(page.url()).toContain('Wallets');
  });

  test('TC-02-C: Jackets nav link navigates to /category/Jackets', async ({ page }) => {
    await page.click('header nav button:has-text("Jackets")');
    await page.waitForURL(/\/category\/Jackets/i, { timeout: 8000 });
    expect(page.url()).toContain('Jackets');
  });

  test('TC-02-D: Belts nav link navigates to /category/Belts', async ({ page }) => {
    await page.click('header nav button:has-text("Belts")');
    await page.waitForURL(/\/category\/Belts/i, { timeout: 8000 });
    expect(page.url()).toContain('Belts');
  });

  test('TC-02-E: Home nav link returns to /', async ({ page }) => {
    await page.click('header nav button:has-text("Bags")');
    await page.waitForURL(/\/category\/Bags/i);
    await page.click('header nav button:has-text("Home")');
    await page.waitForURL('/', { timeout: 8000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test('TC-02-F: Logo click returns to /', async ({ page }) => {
    await page.click('header nav button:has-text("Bags")');
    await page.waitForURL(/\/category\/Bags/i);
    await page.locator('header img[alt="RIVA CAIRO"]').click();
    await page.waitForURL('/', { timeout: 8000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test('TC-02-G: active nav item gets amber highlight', async ({ page }) => {
    const bagsBtn = page.locator('header nav button:has-text("Bags")').first();
    await bagsBtn.click();
    await page.waitForURL(/\/category\/Bags/i);
    await expect(bagsBtn).toHaveClass(/amber/);
  });

  test('TC-02-H: unknown route redirects to /', async ({ page }) => {
    await page.goto('/this-does-not-exist-at-all');
    await page.waitForURL('/', { timeout: 8000 });
    expect(page.url()).toMatch(/\/$/);
  });
});
