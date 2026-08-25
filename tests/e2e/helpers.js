// tests/e2e/helpers.js
// ──────────────────────────────────────────────────────────
// Shared helpers for Riva Cairo E2E test suite
// ──────────────────────────────────────────────────────────

/**
 * Wait for the app to finish loading products from Supabase.
 * Detects the loading spinner or just waits for network idle.
 */
export async function waitForProducts(page) {
  // Wait for the page to become network-idle (Supabase fetch done)
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  // Give React a tick to render
  await page.waitForTimeout(500);
}

/**
 * Navigate to home and wait for the product list to load.
 */
export async function gotoHome(page) {
  await page.goto('/');
  await waitForProducts(page);
}

/**
 * Return the first in-stock product card visible on the current page.
 * Returns null if none found.
 */
export async function getFirstInStockCard(page) {
  // Product cards that do NOT have an "Out of Stock" badge
  const cards = page.locator('[class*="rounded-2xl"]').filter({
    hasNot: page.locator('span:has-text("Out of Stock")'),
  });
  const count = await cards.count();
  if (count === 0) return null;
  return cards.first();
}

/**
 * Click the navbar cart icon to open the cart drawer.
 */
export async function openCart(page) {
  await page.click('[aria-label="Shopping Cart"]');
  await page.waitForSelector('h2:has-text("Your Shopping Bag")', { timeout: 5000 });
}

/**
 * Close the cart drawer.
 */
export async function closeCart(page) {
  await page.click('[aria-label="Close cart"]');
  await page.waitForTimeout(300);
}

/**
 * Open the admin login modal via the Admin button in the navbar.
 */
export async function openAdminModal(page) {
  // On desktop the button text is "Admin"; on mobile it might be icon-only.
  const adminBtn = page.locator('button').filter({ hasText: /^Admin$/ }).first();
  await adminBtn.click();
  await page.waitForSelector('h3:has-text("Store Owner Authentication")', { timeout: 5000 });
}

/**
 * Perform an admin login.  Credentials are env-driven so they stay out of
 * the source file (set ADMIN_EMAIL / ADMIN_PASSWORD in your shell before
 * running).  The test will be skipped when credentials are absent.
 */
export const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || '';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
