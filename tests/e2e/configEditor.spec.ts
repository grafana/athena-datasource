import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from '../../src/types';

const PLUGIN_ID = 'grafana-athena-datasource';

test(
  'should render config editor',
  { tag: '@plugins' },
  async ({ gotoDataSourceConfigPage, readProvisionedDataSource, page }) => {
    const datasource = await readProvisionedDataSource<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>({
      fileName: 'aws-athena.yaml',
      name: 'AWS Athena',
    });
    const configPage = await gotoDataSourceConfigPage(datasource.uid);

    // Default region
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.DefaultRegion.input }).click();
    await page.getByLabel('Select options menu').getByText('us-east-2').click();
    // Catalogs
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.catalog.input }).click();
    await page.getByLabel('Select options menu').getByText('AwsDataCatalog').click();
    // Databases
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.database.input }).click();
    await page.getByLabel('Select options menu').getByText('cloud-datasources-db').click();
    // Workgroups
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.workgroup.input }).click();
    await page.getByLabel('Select options menu').getByText('cloud-datasources').click();

    await expect(configPage.saveAndTest()).toBeOK();
  }
);

test('should show error alert when health check fails', async ({ createDataSourceConfigPage, page }) => {
  const configPage = await createDataSourceConfigPage({ type: PLUGIN_ID });
  await configPage.mockHealthCheckResponse({ message: 'mocked failure' }, 400);

  await expect(configPage.saveAndTest()).not.toBeOK();
  await expect(page.getByText('mocked failure')).toBeVisible();
});

test('should show error alert when backend is unreachable', async ({ createDataSourceConfigPage, page }) => {
  // `route.abort()` never yields an HTTP response, so `saveAndTest()`'s internal
  // `waitForResponse` would hang forever. Fulfilling with a gateway-style error
  // status simulates an unreachable backend while still producing a response.
  const configPage = await createDataSourceConfigPage({ type: PLUGIN_ID });
  await page.route('**/api/datasources/uid/*/health', (route) =>
    route.fulfill({ status: 502, body: 'connect: connection refused' })
  );

  await expect(configPage.saveAndTest()).not.toBeOK();
});
