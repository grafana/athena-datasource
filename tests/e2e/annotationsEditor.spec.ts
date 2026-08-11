import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';

// The local dev AWS account's Athena catalog exposes this table. A DSE2EDEV-provisioned
// instance may point at a different account/catalog, so allow overriding via env var.
const DS_ANNOTATION_TABLE = process.env.DS_INSTANCE_ANNOTATION_TABLE || 'cloudfront_logs';

test('should render annotations editor', async ({ annotationEditPage, page }) => {
  await annotationEditPage.datasource.set('AWS Athena');

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  await annotationEditPage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container).click();
  await page.keyboard.insertText(`select * from ${DS_ANNOTATION_TABLE} where bytes < 100 limit 10`);
  await expect(annotationEditPage.runQuery()).toBeOK();
  const timeDropdown = page.getByText('time, or the first time field', { exact: true });
  await timeDropdown.click({ force: true });
  await expect(page.getByText('date (time)', { exact: true })).toBeVisible();
});
