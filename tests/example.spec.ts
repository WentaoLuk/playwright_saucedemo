import { test, expect } from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';

test.describe('S2: Saucedemo Inventory Page', () => {
  // Credentials for standard user
  const USERNAME = 'standard_user';
  const PASSWORD = 'secret_sauce';

  // beforeEach: log in and land on inventory: using data-test attributes
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    const loginPage = new LoginPage(page);
    await loginPage.login(USERNAME, PASSWORD)
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('TC1: shows exactly 6 products with correct names', async ({ page }) => {
    const items = page.locator('[data-test="inventory-item-name"]');
    await expect(items).toHaveCount(6);

    // Optionally assert on the first & last names
    await expect(items.nth(0)).toHaveText('Sauce Labs Backpack');
    await expect(items.nth(5)).toHaveText('Test.allTheThings() T-Shirt (Red)');
  });

  test('TC2: add & remove from cart updates badge count', async ({ page }) => {
    // initially no badge
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // add first item
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // remove same item
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });

  test('TC3: product sorting works: price low→high', async ({ page }) => {
    // open sort dropdown
    await page.selectOption('[data-test="product-sort-container"]', 'lohi');
    // grab all prices, parse floats
    const prices = await page.$$eval(
      '[data-test="inventory-item-price"]',
      els => els.map(e => parseFloat(e.textContent!.replace('$', '')))
    );
    // simple check: each price ≤ the next one
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  test('TC4: side menu can open and navigate to About', async ({ page }) => {
    // 1) Open burger menu
    await page
      .locator('[data-test="open-menu"]')
      .locator('xpath=..')   // go to its parent button
      .click();
    await expect(page.locator('.bm-menu-wrap')).toBeVisible();

    // 2) Click “About” and wait for the same‐page navigation
    const about = page.locator('[data-test="about-sidebar-link"]');
    await Promise.all([
      page.waitForURL(/saucelabs\.com/),
      about.click(),
    ]);

    // 3) Verify
    await expect(page).toHaveURL(/saucelabs\.com/);
  });

  test('TC5: footer social links navigate to correct domain in new tab', async ({ page, context }) => {
    for (const [selector, domain] of [
      ['[data-test="social-twitter"]',  'x.com'],
      ['[data-test="social-facebook"]', 'facebook.com'],
      ['[data-test="social-linkedin"]', 'linkedin.com'],
    ] as const) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click(selector),
      ]);

      await newPage.waitForLoadState();
      expect(newPage.url()).toContain(domain);

      await newPage.close(); // optional: close the new tab
    }
  });
});