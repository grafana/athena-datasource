import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';

// Pre-provisioned in DSE2EDEV by Pulumi (infra/data-sources/aws/athena.ts); its default database
// has an access_logs table seeded continuously by the data generator (data-sources#1625).
const ATHENA_DATASOURCE_NAME = 'Athena (PDC)';

test('should run a real query against Athena in DSE2EDEV', async ({ explorePage, page }) => {
  // A throttled retry below can take up to 30s; extend past Playwright's default test timeout.
  test.setTimeout(90_000);

  await explorePage.goto();
  // goto() doesn't guarantee the page is interactive yet on a real, remote Cloud instance;
  // give the picker more room than DataSourcePicker.set()'s internal 5s default.
  await expect(page.getByTestId('data-testid Select a data source')).toBeVisible({ timeout: 30_000 });
  await explorePage.datasource.set(ATHENA_DATASOURCE_NAME);

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  await explorePage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container).click();
  await page.keyboard.insertText(
    `select date, sum(received_bytes) as bytes from access_logs group by 1 order by 1 limit 10`
  );

  // GetWorkGroup is occasionally throttled under concurrent CI load; retry with backoff.
  await expect(async () => {
    await expect(explorePage.runQuery()).toBeOK();
  }).toPass({ timeout: 30_000, intervals: [1_000, 2_000, 5_000] });
});
