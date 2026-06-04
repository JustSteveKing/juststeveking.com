import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage loads and has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Personal Website/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=Articles');
    await expect(page).toHaveURL(/\/articles/);
    await expect(page.locator('h1')).toContainText(/Articles/i);
  });

  test('search modal opens', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.locator('button[aria-label*="Search"]');
    if (await searchButton.isVisible()) {
        await searchButton.click();
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    }
  });

  test('api diagnostic component is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('section[aria-label="API diagnostic preview"]')).toBeVisible();
  });
});
