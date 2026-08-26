import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';

// Same pre-provisioned datasource used by tests-cloud/queryEditor.spec.ts; its connection
// details (region/catalog/database/workgroup/credentials) are Pulumi-managed, so this test only
// reads the config page rather than editing/saving it (DSE2EDEV is a shared instance).
const ATHENA_DATASOURCE_NAME = process.env.DS_INSTANCE_NAME || 'Athena (PDC)';

test('should load config page and pass health check for Athena in DSE2EDEV', async ({
  page,
  gotoDataSourceConfigPage,
  grafanaAPIClient,
}) => {
  // Fetch the full list rather than the by-name endpoint, which mishandles names with
  // spaces/parens -- avoids URL-encoding the name into a path segment altogether. Fall back to
  // matching by plugin type if the name doesn't match exactly (e.g. trailing whitespace from
  // how the value round-trips through Vault/GitHub Actions env export).
  const response = await grafanaAPIClient.request.get('/api/datasources');
  const datasources: Array<{ name: string; uid: string; type: string }> = await response.json();
  const datasource =
    datasources.find((ds) => ds.name.trim() === ATHENA_DATASOURCE_NAME.trim()) ??
    datasources.find((ds) => ds.type === 'grafana-athena-datasource');
  if (!datasource) {
    throw new Error(`No Athena datasource found among ${datasources.length} datasources`);
  }
  const configPage = await gotoDataSourceConfigPage(datasource.uid);

  // DSE2EDEV's datasource is Pulumi-managed -- verify the fields render, not their specific
  // values (catalog/database/workgroup are Pulumi-generated resource names, not literals).
  // goto() doesn't guarantee the page is interactive yet on a real, remote Cloud instance; give
  // the first field more room than the 5s default (same class of issue as the other cloud specs).
  await expect(page.getByTestId(selectors.components.ConfigEditor.catalog.wrapper)).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByTestId(selectors.components.ConfigEditor.database.wrapper)).toBeVisible();
  await expect(page.getByTestId(selectors.components.ConfigEditor.workgroup.wrapper)).toBeVisible();

  // Provisioned/non-editable datasources render "Test" instead of "Save & test".
  await page.getByRole('button', { name: /^(Save & test|Test)$/ }).click();
  await expect(configPage).toHaveAlert('success', { hasText: 'Data source is working' });
});
