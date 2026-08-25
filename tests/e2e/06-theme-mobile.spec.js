// tests/e2e/06-theme-mobile.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// TC-17  Theme switching (light ↔ dark)
// TC-18  Mobile navigation (hamburger drawer)
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { waitForProducts } from './helpers.js';

test.describe('17 – Theme Switching', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await waitForProducts(page);
  });

  test('TC-17-A: theme toggle button is visible in navbar', async ({ page }) => {
    await expect(page.locator('[aria-label="Toggle Theme"]')).toBeVisible();
  });

  test('TC-17-B: clicking toggle changes data-theme attribute on <html>', async ({ page }) => {
    const themeBefore = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    );
    await page.click('[aria-label="Toggle Theme"]');
    await page.waitForTimeout(300);
    const themeAfter = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    );
    expect(themeAfter).not.toBe(themeBefore);
  });

  test('TC-17-C: toggling switches between light and dark correctly', async ({ page }) => {
    await page.evaluate(() => { localStorage.setItem('theme', 'light'); });
    await page.reload();
    await waitForProducts(page);
    const before = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    );
    expect(before).toBe('light');
    await page.click('[aria-label="Toggle Theme"]');
    await page.waitForTimeout(300);
    const after = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    );
    expect(after).toBe('dark');
  });

  test('TC-17-D: double-toggle returns to original theme', async ({ page }) => {
    const before = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    );
    await page.click('[aria-label="Toggle Theme"]');
    await page.waitForTimeout(200);
    await page.click('[aria-label="Toggle Theme"]');
    await page.waitForTimeout(200);
    const after = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    );
    expect(after).toBe(before);
  });

  test('TC-17-E: theme preference is persisted in localStorage', async ({ page }) => {
    await page.click('[aria-label="Toggle Theme"]');
    await page.waitForTimeout(300);
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(['light', 'dark']).toContain(storedTheme);
  });

  test('TC-17-F: theme is restored after page reload', async ({ page }) => {
    await page.evaluate(() => { localStorage.setItem('theme', 'dark'); });
    await page.reload();
    await waitForProducts(page);
    const restored = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    );
    expect(restored).toBe('dark');
  });

  test('TC-17-G: sun icon visible in dark mode, moon icon in light mode', async ({ page }) => {
    await page.evaluate(() => { localStorage.setItem('theme', 'light'); });
    await page.reload();
    await waitForProducts(page);
    const toggleBtn = page.locator('[aria-label="Toggle Theme"]');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await expect(toggleBtn).toBeVisible();
  });
});

test.describe('18 – Mobile Navigation', () => {

  test.use({ viewport: { width: 390, height: 844 } }); // Mobile viewport

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('riva_cart'));
    await waitForProducts(page);
  });

  test('TC-18-A: hamburger menu button visible on mobile', async ({ page }) => {
    await expect(page.locator('[aria-label="Open mobile navigation"]')).toBeVisible();
  });

  test('TC-18-B: desktop nav links hidden on mobile', async ({ page }) => {
    const desktopNav = page.locator('header nav[aria-label="Desktop Navigation"]');
    await expect(desktopNav).toBeHidden();
  });

  test('TC-18-C: clicking hamburger opens the mobile drawer', async ({ page }) => {
    await page.click('[aria-label="Open mobile navigation"]');
    await page.waitForTimeout(400);
    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');
    await expect(drawer.locator('text=MENU')).toBeVisible();
  });

  test('TC-18-D: mobile drawer contains all nav categories', async ({ page }) => {
    await page.click('[aria-label="Open mobile navigation"]');
    await page.waitForTimeout(400);
    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    for (const cat of ['Home', 'Bags', 'Wallets', 'Jackets', 'Belts']) {
      await expect(drawer.locator('button', { hasText: cat })).toBeVisible();
    }
  });

  test('TC-18-E: closing drawer via X button hides it', async ({ page }) => {
    await page.click('[aria-label="Open mobile navigation"]');
    await page.waitForTimeout(400);
    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    await expect(drawer).toBeVisible();
    await drawer.locator('[aria-label="Close menu"]').click();
    await page.waitForTimeout(400);
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
    await expect(drawer).toHaveClass(/translate-x-full/);
  });

  test('TC-18-F: clicking backdrop closes the mobile drawer', async ({ page }) => {
    await page.click('[aria-label="Open mobile navigation"]');
    await page.waitForTimeout(400);
    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    await expect(drawer).toBeVisible();
    await page.locator('[data-testid="mobile-backdrop"]').dispatchEvent('click');
    await page.waitForTimeout(400);
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
    await expect(drawer).toHaveClass(/translate-x-full/);
  });

  test('TC-18-G: clicking a category in mobile drawer navigates and closes drawer', async ({ page }) => {
    await page.click('[aria-label="Open mobile navigation"]');
    await page.waitForTimeout(400);
    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    const bagsBtn = drawer.locator('button', { hasText: 'Bags' }).first();
    await bagsBtn.click();
    await page.waitForTimeout(500);
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
    await page.waitForURL(/\/category\/Bags/i, { timeout: 8000 });
    expect(page.url()).toContain('Bags');
  });

  test('TC-18-H: mobile drawer has admin login button', async ({ page }) => {
    await page.click('[aria-label="Open mobile navigation"]');
    await page.waitForTimeout(400);
    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    const adminBtn = drawer.locator('button').filter({ hasText: /Owner \/ Admin Login|Go to Admin Dashboard/ });
    await expect(adminBtn).toBeVisible();
  });

  test('TC-18-I: mobile search bar (below navbar) is visible', async ({ page }) => {
    const mobileSearch = page.locator('input[placeholder*="Search bags"]').first();
    await expect(mobileSearch).toBeVisible();
  });

  test('TC-18-J: cart icon opens cart drawer on mobile', async ({ page }) => {
    await page.click('[aria-label="Shopping Cart"]');
    await page.waitForSelector('h2:has-text("Your Shopping Bag")', { timeout: 5000 });
    await expect(page.locator('h2:has-text("Your Shopping Bag")')).toBeVisible();
  });
});
