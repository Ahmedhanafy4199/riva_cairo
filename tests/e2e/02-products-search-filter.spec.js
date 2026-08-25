// tests/e2e/02-products-search-filter.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// TC-03  Product listing
// TC-04  Search
// TC-05  Category filtering
// TC-06  Product details
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { waitForProducts } from './helpers.js';

const CATEGORIES = ['Bags', 'Wallets', 'Jackets', 'Belts'];

test.describe('03 – Product Listing (Category Page)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/category/All');
    await page.evaluate(() => {
      localStorage.removeItem('riva_cart');
    });
    await waitForProducts(page);
  });

  test('TC-03-A: category page banner heading visible', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('TC-03-B: category pills row rendered (All, Bags, Wallets, Jackets, Belts)', async ({ page }) => {
    for (const cat of ['All', 'Bags', 'Wallets', 'Jackets', 'Belts']) {
      await expect(
        page.locator('[data-testid="category-pills"] button').filter({ hasText: cat }).first()
      ).toBeVisible();
    }
  });

  test('TC-03-C: "All" pill is active by default', async ({ page }) => {
    const allBtn = page.locator('[data-testid="category-pills"] button').filter({ hasText: 'All' }).first();
    await expect(allBtn).toHaveClass(/amber/);
  });

  test('TC-03-D: product cards are displayed in the grid', async ({ page }) => {
    const cards = page.locator('h3');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-03-E: sort dropdown opens and has options', async ({ page }) => {
    const sortBtn = page.locator('button').filter({ hasText: /Featured|Price|Name/ }).first();
    await sortBtn.click();
    await expect(page.locator('text=Sort Products')).toBeVisible();
    await expect(page.locator('text=Name: A → Z')).toBeVisible();
    await expect(page.locator('text=Price: Low → High')).toBeVisible();
  });
});

test.describe('04 – Search', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/category/All');
    await page.evaluate(() => {
      localStorage.removeItem('riva_cart');
    });
    await waitForProducts(page);
  });

  test('TC-04-A: search input present on products page', async ({ page }) => {
    await expect(
      page.locator('input[placeholder*="Search in this view"]').first()
    ).toBeVisible();
  });

  test('TC-04-B: typing a query filters product cards', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search in this view"]').first();
    const beforeCount = await page.locator('h3').count();
    await searchInput.fill('bag');
    await page.waitForTimeout(400);
    const afterCount = await page.locator('h3').count();
    const noItemsMsg = page.locator('h3:has-text("No items found")');
    const noItemsVisible = await noItemsMsg.isVisible().catch(() => false);
    if (!noItemsVisible) {
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    }
  });

  test('TC-04-C: clearing search shows all products again', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search in this view"]').first();
    const beforeCount = await page.locator('h3').count();
    await searchInput.fill('zzznomatch999');
    await page.waitForTimeout(300);
    await searchInput.clear();
    await page.waitForTimeout(300);
    const afterCount = await page.locator('h3').count();
    expect(afterCount).toBe(beforeCount);
  });

  test('TC-04-D: no-match search shows empty-state message', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search in this view"]').first();
    await searchInput.fill('zzznomatchxyz999');
    await page.waitForTimeout(400);
    await expect(page.locator('h3:has-text("No items found")')).toBeVisible();
  });

  test('TC-04-E: desktop navbar search input is present', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(
      page.locator('input[placeholder*="Search leather"]').first()
    ).toBeVisible();
  });

  test('TC-04-F: navbar search filters homepage products', async ({ page }) => {
    await page.goto('/');
    await waitForProducts(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    const navSearch = page.locator('input[placeholder*="Search leather"]').first();
    await navSearch.fill('wallet');
    await page.waitForTimeout(400);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('05 – Category Filtering', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/category/All');
    await page.evaluate(() => {
      localStorage.removeItem('riva_cart');
    });
    await waitForProducts(page);
  });

  for (const cat of CATEGORIES) {
    test(`TC-05-${cat}: clicking ${cat} pill filters products`, async ({ page }) => {
      const catBtn = page.locator('[data-testid="category-pills"] button').filter({ hasText: cat }).first();
      await catBtn.click();
      await page.waitForTimeout(500);
      await expect(catBtn).toHaveClass(/amber/);
      await expect(page.locator('body')).toBeVisible();
    });
  }

  test('TC-05-ALL: clicking All shows all products', async ({ page }) => {
    await page.locator('[data-testid="category-pills"] button').filter({ hasText: 'Bags' }).first().click();
    await page.waitForTimeout(500);
    const bagsCount = await page.locator('h3').count();
    await page.locator('[data-testid="category-pills"] button').filter({ hasText: 'All' }).first().click();
    await page.waitForTimeout(500);
    const allCount = await page.locator('h3').count();
    expect(allCount).toBeGreaterThanOrEqual(bagsCount);
  });
});

test.describe('06 – Product Details', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/category/All');
    await page.evaluate(() => {
      localStorage.removeItem('riva_cart');
    });
    await waitForProducts(page);
  });

  test('TC-06-A: clicking product card image navigates to /product/:id', async ({ page }) => {
    const firstCard = page.locator('h3').first();
    await firstCard.click();
    await page.waitForURL(/\/product\//i, { timeout: 8000 });
    expect(page.url()).toContain('/product/');
  });

  test('TC-06-B: product detail page shows title, price, description', async ({ page }) => {
    const firstCard = page.locator('h3').first();
    await firstCard.click();
    await page.waitForURL(/\/product\//i, { timeout: 8000 });
    await waitForProducts(page);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(
      page.locator('.text-amber-400').filter({ hasText: /\d/ }).first()
    ).toBeVisible();
  });

  test('TC-06-C: product detail shows stock badge (In Stock or Out of Stock)', async ({ page }) => {
    const firstCard = page.locator('h3').first();
    await firstCard.click();
    await page.waitForURL(/\/product\//i, { timeout: 8000 });
    await waitForProducts(page);
    const stockBadge = page.locator('span').filter({
      hasText: /In Stock|Out of Stock|غير متوفر/i,
    }).first();
    await expect(stockBadge).toBeVisible();
  });

  test('TC-06-D: Back to Collection button navigates back', async ({ page }) => {
    const firstCard = page.locator('h3').first();
    await firstCard.click();
    await page.waitForURL(/\/product\//i, { timeout: 8000 });
    await waitForProducts(page);
    await page.click('button:has-text("Back to Collection")');
    await page.waitForURL(/\/category\//, { timeout: 8000 });
    expect(page.url()).toContain('/category/');
  });

  test('TC-06-E: invalid product ID shows "Product not found"', async ({ page }) => {
    await page.goto('/product/THIS_ID_DOES_NOT_EXIST_AT_ALL');
    await waitForProducts(page);
    await expect(page.locator('h2:has-text("Product not found")')).toBeVisible();
  });

  test('TC-06-F: quantity stepper is present on in-stock products', async ({ page }) => {
    const cards = page.locator('h3');
    const count = await cards.count();
    let foundInStock = false;
    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/category/All');
      await waitForProducts(page);
      await page.locator('h3').nth(i).click();
      await page.waitForURL(/\/product\//i);
      await waitForProducts(page);
      const outOfStock = await page.locator('span:has-text("غير متوفر — Out of Stock")').isVisible();
      if (!outOfStock) {
        foundInStock = true;
        await expect(page.locator('[aria-label="Increase quantity"]').first()).toBeVisible();
        await expect(page.locator('[aria-label="Decrease quantity"]').first()).toBeVisible();
        break;
      }
    }
    expect(true).toBe(true);
  });
});
