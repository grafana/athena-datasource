import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';

test('should render annotations editor', async ({ annotationEditPage, page }) => {
  const regionSelector = selectors.components.ConfigEditor.region.wrapper;
  await annotationEditPage.datasource.set('AWS Athena');

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  await annotationEditPage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container).click();
  await page.keyboard.insertText(`select * from cloudfront_logs where bytes < 100`);
  await expect(annotationEditPage.runQuery()).toBeOK();
  const table = page.locator('.filter-table');
  const timeDropdown = table.getByText('time', { exact: true }).locator('..').locator('input').locator('..');
  await timeDropdown.click();
  expect(page.getByText('date (time)', { exact: true })).toBeVisible();
});
