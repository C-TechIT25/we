import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('QR downloads, attribution controls, responsive analytics and filtered reports', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tests/feature-fixture.html');
  await expect(page.getByRole('button', { name: 'PNG', exact: true })).toBeEnabled();
  await expect(page.getByLabel('Tracked profile URL')).toHaveValue(/utm_source=qr/);
  const svgDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'SVG', exact: true }).click();
  const svg = await svgDownload;
  expect(await fs.readFile(await svg.path(), 'utf8')).toContain('<svg');
  await page.getByRole('button', { name: 'Instagram', exact: true }).click();
  await expect(page.getByLabel('Tracked profile URL')).toHaveValue(/utm_source=instagram/);
  await page.getByLabel('Campaign', { exact: true }).fill('Launch & poster');
  await expect(page.getByLabel('Tracked profile URL')).toHaveValue(/Launch\+%26\+poster/);
  await page.getByRole('combobox', { name: 'Company', exact: true }).click();
  await page.getByRole('option', { name: 'Second company', exact: true }).click();
  await page.getByRole('combobox', { name: 'Date range (UTC)', exact: true }).click();
  await page.getByRole('option', { name: 'Custom dates' }).click();
  const date = new Date().toISOString().slice(0, 10);
  await page.getByLabel('From (UTC)', { exact: true }).fill(date);
  await page.getByLabel('To (UTC, inclusive)', { exact: true }).fill(date);
  await page.getByRole('button', { name: 'Apply dates' }).click();
  await expect(page.getByRole('table', { name: 'Traffic sources and campaigns' })).toContainText('qr');
  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csv = await csvDownload;
  const csvText = await fs.readFile(await csv.path(), 'utf8');
  expect(csvText).toContain('Second company');
  expect(csvText).toContain('"Profile views","1"');
  expect(csvText).not.toContain('"instagram"');
  // Exercise pagination and Unicode names across a 90-day report.
  await page.getByRole('combobox', { name: 'Company', exact: true }).click();
  await page.getByRole('option', { name: 'All companies', exact: true }).click();
  await page.getByRole('combobox', { name: 'Date range (UTC)', exact: true }).click();
  await page.getByRole('option', { name: 'Last 90 days' }).click();
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const pdf = await pdfDownload;
  await pdf.saveAs(testInfo.outputPath('analytics-report.pdf'));
  const pdfBuffer = await fs.readFile(await pdf.path());
  expect(pdfBuffer.subarray(0, 4).toString()).toBe('%PDF');
  expect((pdfBuffer.toString('latin1').match(/\/Type \/Page\b/g) || []).length).toBeGreaterThan(2);
  await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('scheduled links appear and expire without a reload, respecting order', async ({ page }) => {
  await page.goto('/tests/feature-fixture.html?schedule');
  const visible = page.getByTestId('visible-links');
  await expect(visible).toHaveText('YouTube, Website');
  await expect(visible).toHaveText('YouTube, Scheduled social, Website', { timeout: 4000 });
  await expect(visible).toHaveText('YouTube, Website', { timeout: 5000 });
  await expect(page.getByText('Hidden social', { exact: true })).toHaveCount(0);
  await expect(page.locator('.hub-social-card').first()).toContainText('YouTube');
});

test('empty and failed loads are clear; errors disable export', async ({ page }) => {
  await page.goto('/tests/feature-fixture.html?empty');
  await expect(page.getByText('No attributed activity yet')).toBeVisible();
  await page.goto('/tests/feature-fixture.html?error');
  await expect(page.getByRole('alert')).toContainText('Analytics could not be loaded');
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeDisabled();
});
