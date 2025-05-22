// tests/cart.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { log } from 'console';

test.describe('S1: Saucedemo Shopping Cart Page', () => {
  const USERNAME = 'standard_user';
  const PASSWORD = 'secret_sauce';

  test.beforeEach(async ({ page }) => {
    // 1) Log in
    await page.goto('https://www.saucedemo.com/');
    const loginPage = new LoginPage(page)
    loginPage.login(USERNAME, PASSWORD)
    await expect(page).toHaveURL(/inventory\.html$/);

    // 2) Add one item to cart and navigate to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="shopping-cart-link"]');
    await expect(page).toHaveURL(/cart\.html$/);
  });

  test('TC1: displays correct headers and labels', async ({ page }) => {
    await expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
    await expect(page.locator('[data-test="cart-quantity-label"]')).toHaveText('QTY');
    await expect(page.locator('[data-test="cart-desc-label"]')).toHaveText('Description');
  });

  test('TC2: shows added item with correct name, quantity and price', async ({ page }) => {
    const itemRow = page.locator('[data-test="inventory-item"]');
    await expect(itemRow).toHaveCount(1);

    // name
    await expect(itemRow.locator('[data-test="inventory-item-name"]'))
      .toHaveText('Sauce Labs Backpack');
    // quantity
    await expect(itemRow.locator('[data-test="item-quantity"]'))
      .toHaveText('1');
    // price
    await expect(itemRow.locator('[data-test="inventory-item-price"]'))
      .toHaveText('$29.99');
  });

  test('TC3: remove button removes the item and badge disappears', async ({ page }) => {
    // click Remove in cart
    await page.click('[data-test="remove-sauce-labs-backpack"]');

    // no more items in cart
    await expect(page.locator('[data-test="cart-item"]')).toHaveCount(0);

    // badge on header should be gone
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });

  test('TC4: Continue Shopping returns to inventory page', async ({ page }) => {
    await page.click('[data-test="continue-shopping"]');
    await expect(page).toHaveURL(/inventory\.html$/);
  });

  test('TC5: Checkout button proceeds to first checkout step', async ({ page }) => {
    await page.click('[data-test="checkout"]');
    await expect(page).toHaveURL(/checkout-step-one\.html$/);
  });

  test('TC6: header menu works on cart page', async ({ page }) => {
    // open menu
    await page
      .locator('[data-test="open-menu"]')
      .locator('xpath=..')   // go to its parent button
      .click();
    await expect(page.locator('.bm-menu-wrap')).toBeVisible();

    // reset app state
    await page.click('[data-test="reset-sidebar-link"]');
    // after reset, cart badge should be absent
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });
});