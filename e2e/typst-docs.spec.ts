import { expect, test } from '@playwright/test';

const basePath = '/rspress-plugin-typst';

test.describe('rspress-plugin-typst docs site', () => {
  test('home page loads and links to Typst examples', async ({ page }) => {
    await page.goto(`${basePath}/`);
    await expect(page).toHaveTitle(/rspress-plugin-typst/i);
    await expect(
      page.getByRole('heading', { name: 'rspress-plugin-typst' }),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Hello Typst' }),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Math & Code' }),
    ).toBeVisible();
  });

  test('Hello Typst page renders Typst HTML content', async ({ page }) => {
    await page.goto(`${basePath}/guide/hello.html`);
    await expect(page).toHaveTitle(/Hello Typst/i);

    const doc = page.locator('.rspress-typst');
    await expect(doc).toBeVisible();
    await expect(doc.getByRole('heading', { name: 'Hello Typst' })).toBeVisible();
    await expect(doc.getByText('Conventional routing')).toBeVisible();
    await expect(doc.getByText('Optional frontmatter')).toBeVisible();
    await expect(doc.locator('code').filter({ hasText: '.typ' }).first()).toBeVisible();
  });

  test('Math & Code page shows plugin sys.inputs', async ({ page }) => {
    await page.goto(`${basePath}/guide/math.html`);
    await expect(page).toHaveTitle(/Math/i);

    const doc = page.locator('.rspress-typst');
    await expect(doc).toBeVisible();
    await expect(doc.getByRole('heading', { name: 'Math and Code' })).toBeVisible();
    await expect(doc.getByText('rspress-plugin-typst')).toBeVisible();
    await expect(doc.locator('pre code')).toBeVisible();
  });

  test('sidebar navigation between Typst pages works', async ({ page }) => {
    await page.goto(`${basePath}/guide/hello.html`);
    await expect(page.locator('.rspress-typst')).toBeVisible();

    await page.locator('.rp-doc-layout__sidebar').getByRole('link', { name: 'Math & Code' }).click();
    await expect(page).toHaveURL(/\/guide\/math\.html$/);
    await expect(page.locator('.rspress-typst')).toContainText('rspress-plugin-typst');

    await page.locator('.rp-doc-layout__sidebar').getByRole('link', { name: 'Hello Typst' }).click();
    await expect(page).toHaveURL(/\/guide\/hello\.html$/);
    await expect(page.locator('.rspress-typst')).toContainText('Conventional routing');
  });

  test('getting started guide is available', async ({ page }) => {
    await page.goto(`${basePath}/guide/getting-started.html`);
    await expect(
      page.getByRole('heading', { name: 'Getting Started' }),
    ).toBeVisible();
    await expect(page.getByText('pluginTypst', { exact: true })).toBeVisible();
  });
});
