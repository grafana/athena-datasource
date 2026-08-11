import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';

test('should render annotations editor', async ({ annotationEditPage, page }) => {
  await annotationEditPage.datasource.set('AWS Athena');

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  await annotationEditPage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container).click();
  await page.keyboard.insertText(`select * from cloudfront_logs where bytes < 100 limit 10`);

  // Athena's GetWorkGroup API is occasionally throttled (ThrottlingException: Rate exceeded) under
  // concurrent CI load against the shared e2e AWS account. The query itself succeeds within seconds
  // on retry, so retry the test-query action rather than failing on a single throttled response.
  // Use a slower backoff than toPass()'s default (100ms) so retries don't add to the rate-limit
  // pressure that caused the throttling in the first place.
  await expect(async () => {
    await expect(annotationEditPage.runQuery()).toBeOK();
  }).toPass({ timeout: 30_000, intervals: [1_000, 2_000, 5_000] });
  // The dropdown's option list depends on the query result's field names, which can still be
  // settling right after the query above resolves. Retry the click rather than assuming the
  // forced click lands on an already-interactive combobox.
  const timeDropdown = page.getByText('time, or the first time field', { exact: true });
  await expect(async () => {
    await timeDropdown.click({ force: true });
    await expect(page.getByText('date (time)', { exact: true })).toBeVisible({ timeout: 5_000 });
  }).toPass({ timeout: 15_000 });
});
