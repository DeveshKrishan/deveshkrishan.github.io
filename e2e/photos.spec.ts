import { expect, test } from './mock-api';

const alcatrazAlt = 'An abandoned concrete building behind a chain-link fence on Alcatraz Island';

test('opens a photo, steps to the next one, and closes', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
  }
  await page.getByRole('link', { name: 'about', exact: true }).click();

  await page.getByRole('button', { name: alcatrazAlt }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('alcatraz island, san francisco, ca');

  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText('berryessa bart, san jose, ca');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: alcatrazAlt }).click();
  await dialog.getByRole('button', { name: 'close' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
