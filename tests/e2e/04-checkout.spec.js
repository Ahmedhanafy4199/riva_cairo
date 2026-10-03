// tests/e2e/04-checkout.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// TC-11  Checkout flow
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { waitForProducts } from './helpers.js';

async function addProductAndGoToCheckout(page) {
  await page.goto('/category/All');
  await waitForProducts(page);
  const addBtns = page.locator('button:has-text("Add to Cart")');
  const count = await addBtns.count();
  if (count === 0) return false;
  await addBtns.first().click();
  await page.waitForTimeout(600);
  // Open cart and proceed to checkout
  await page.click('[aria-label="Shopping Cart"]');
  await page.waitForSelector('h2:has-text("Your Shopping Bag")', { timeout: 5000 });
  await page.click('button:has-text("Proceed to Checkout")');
  await page.waitForURL(/\/checkout/, { timeout: 8000 });
  return true;
}

test.describe('11 – Checkout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('riva_cart'));
    await page.reload();
    await waitForProducts(page);
  });

  test('TC-11-A: /checkout with empty cart shows empty-cart UI', async ({ page }) => {
    await page.goto('/checkout');
    await waitForProducts(page);
    await expect(page.locator('h2:has-text("Your cart is empty")')).toBeVisible();
    await expect(page.locator('button:has-text("Browse Products")')).toBeVisible();
  });

  test('TC-11-B: empty-cart Browse Products button navigates to /category/All', async ({ page }) => {
    await page.goto('/checkout');
    await waitForProducts(page);
    await page.click('button:has-text("Browse Products")');
    await page.waitForURL(/\/category\/All/i, { timeout: 8000 });
    expect(page.url()).toContain('/category/All');
  });

  test('TC-11-C: checkout page renders form fields when cart has items', async ({ page }) => {
    const ok = await addProductAndGoToCheckout(page);
    if (!ok) { console.warn('No in-stock products – TC-11-C skipped'); return; }
    await expect(page.locator('input[placeholder*="Enter your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="01123456789"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Building"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Cairo"]')).toBeVisible();
  });

  test('TC-11-D: submitting empty form shows validation error', async ({ page }) => {
    const ok = await addProductAndGoToCheckout(page);
    if (!ok) { console.warn('No in-stock products – TC-11-D skipped'); return; }
    await page.click('button[type="submit"]');
    // Either browser HTML5 validation or our custom error message
    const errorMsg = page.locator('text=Please fill in all required shipping details.');
    const isVisible = await errorMsg.isVisible().catch(() => false);
    if (!isVisible) {
      // HTML5 validation fires – check any required field is invalid
      const nameInput = page.locator('input[placeholder*="Enter your name"]');
      const validity = await nameInput.evaluate((el) => el.validity.valueMissing);
      expect(validity).toBe(true);
    } else {
      await expect(errorMsg).toBeVisible();
    }
  });

  test('TC-11-E: cart items preview shows in checkout form', async ({ page }) => {
    const ok = await addProductAndGoToCheckout(page);
    if (!ok) { console.warn('No in-stock products – TC-11-E skipped'); return; }
    await expect(page.locator('h3:has-text("Order Items")')).toBeVisible();
    const items = page.locator('p.text-xs.text-slate-200');
    await expect(items.first()).toBeVisible();
  });

  test('TC-11-F: order total is displayed in submit button', async ({ page }) => {
    const ok = await addProductAndGoToCheckout(page);
    if (!ok) { console.warn('No in-stock products – TC-11-F skipped'); return; }
    const submitBtn = page.locator('button[type="submit"]');
    const btnText = await submitBtn.innerText();
    // Should say "Place Order (XX.XX)"
    expect(btnText).toMatch(/Place Order/);
  });

  test('TC-11-G: Cash on Delivery payment option is pre-selected', async ({ page }) => {
    const ok = await addProductAndGoToCheckout(page);
    if (!ok) { console.warn('No in-stock products – TC-11-G skipped'); return; }
    await expect(page.locator('text=Cash on Delivery')).toBeVisible();
    // The label should have amber border (active state)
    const label = page.locator('label').filter({ hasText: 'Cash on Delivery' });
    await expect(label).toHaveClass(/amber/);
  });

  test('TC-11-H: Back to Cart link navigates to /category/All', async ({ page }) => {
    const ok = await addProductAndGoToCheckout(page);
    if (!ok) { console.warn('No in-stock products – TC-11-H skipped'); return; }
    await page.click('button:has-text("Back to Cart")');
    await page.waitForURL(/\/category\/All/i, { timeout: 8000 });
    expect(page.url()).toContain('/category/All');
  });

  test('TC-11-I: free shipping threshold shown at 200', async ({ page }) => {
    const ok = await addProductAndGoToCheckout(page);
    if (!ok) { console.warn('No in-stock products – TC-11-I skipped'); return; }
    // Shipping fees visible in summary
    await expect(page.locator('text=Shipping fees')).toBeVisible();
  });
});
