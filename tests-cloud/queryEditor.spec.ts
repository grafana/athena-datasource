import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';

// Pre-provisioned in DSE2EDEV by Pulumi (infra/data-sources/aws/athena.ts); its default database
// has an access_logs table seeded continuously by the data generator (data-sources#1625). The
// datasource name is instance-specific (cron.yml sources it from Vault), so it's passed in via
// env rather than hardcoded -- other environments running this suite may provision it differently.
const ATHENA_DATASOURCE_NAME = process.env.DS_INSTANCE_NAME || 'Athena (PDC)';

test('should run a real query against Athena in DSE2EDEV', async ({ explorePage, page }) => {
  test.setTimeout(60_000);

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

  // runQuery()'s internal click has only a 1s timeout; make sure the button has settled first
  // (same class of issue as the datasource picker above -- remote Cloud pages load slower).
  const runButton = page.getByTestId('data-testid RefreshPicker run button').first();
  await expect(runButton).toBeVisible({ timeout: 30_000 });
  await runButton.click();

  // This instance routes queries through Grafana's newer query-service API
  // (apis/query.grafana.app/.../query), not the legacy /api/ds/query path plugin-e2e's
  // runQuery() waits on, and returns the result after several polling requests -- assert on
  // the rendered table instead of a specific network response.
  await expect(explorePage.tablePanel.data.first()).toBeVisible({ timeout: 30_000 });
});
