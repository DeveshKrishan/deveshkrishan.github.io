import type { Page } from '@playwright/test';

import { expect, test } from './mock-api';

async function openSection(page: Page, label: 'about' | 'skills', isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
  }

  await page.getByRole('link', { name: label, exact: true }).click();

  if (isMobile) {
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  }
}

test('shows the intro, activity widgets, and footer', async ({ page, isMobile }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Devesh Krishan', level: 1 })).toBeVisible();
  await expect(page.locator('.intro-heatmap-total')).toHaveText('12 contributions in 2026');
  await expect(page.getByText('1,280 unique visitors')).toBeVisible();

  await openSection(page, 'skills', isMobile);
  await expect(page.getByRole('heading', { name: 'skills', level: 2 })).toBeVisible();

  await openSection(page, 'about', isMobile);
  await expect(page.getByRole('heading', { name: "what i've been up to" })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Night Drive' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Kickbox' })).toBeVisible();
  await expect(page.getByText('125 views · 5:58')).toBeVisible();
  await expect(page.getByText(/published Oct 11, 2026/)).toBeVisible();

  const valorant = page.getByRole('link', { name: 'VALORANT' }).first();
  await expect(valorant).toBeVisible();
  await expect(valorant.locator('.activity-valorant-logo')).toBeVisible();
  await expect(valorant.locator('img')).toHaveCount(0);

  await expect(page.getByRole('heading', { name: 'recent restaurants rated' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Beli' })).toBeVisible();
  await expect(page.locator('.activity-error')).toHaveCount(0);
});

test('shows a friendly message when YouTube is rate-limited', async ({ page }) => {
  await page.route('**/api/youtube/recent-videos**', async (route) => {
    await route.fulfill({
      status: 429,
      json: { error: 'rate limited', code: 'rate_limited' },
    });
  });

  await page.goto('/#about');

  await expect(page.getByText('youtube is rate-limited. try again soon.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Night Drive' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Kickbox' })).toHaveCount(0);
});
