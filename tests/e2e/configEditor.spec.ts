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
    await gotoDataSourceConfigPage(datasource.uid);

    // Assert against whatever the provisioned datasource actually contains, rather than
    // hardcoded literals, so this test keeps working if the provisioned region/catalog/
    // database/workgroup values ever change without needing an update here too.
    const { defaultRegion, catalog, database, workgroup } = datasource.jsonData;
    expect(defaultRegion).toBeTruthy();
    expect(catalog).toBeTruthy();
    expect(database).toBeTruthy();
    expect(workgroup).toBeTruthy();

    // Default region
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.DefaultRegion.input }).click();
    await page.getByLabel('Select options menu').getByText(defaultRegion!).click();
    // Catalogs
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.catalog.input }).click();
    await page.getByLabel('Select options menu').getByText(catalog!).click();
    // Databases
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.database.input }).click();
    await page.getByLabel('Select options menu').getByText(database!).click();
    // Workgroups
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.workgroup.input }).click();
    await page.getByLabel('Select options menu').getByText(workgroup!).click();

    // Match both `Save & test` (editable: true) and `Test` (editable: false) — provisioned
    // datasources render either depending on `editable`, and `configPage.saveAndTest()` times
    // out on the `editable: false` case.
    //
    // Athena's GetWorkGroup API (called by the health check) is occasionally throttled
    // (ThrottlingException: Rate exceeded) under concurrent CI load against the shared e2e AWS
    // account. Retry the health check rather than failing on a single throttled response.
    //
    // Assert on the specific success text, not a generic success-severity alert — each dropdown
    // reselection above triggers its own "datasource settings saved" toast via ConfigSelect's
    // auto-save, which is also success-severity and would otherwise produce a false positive
    // regardless of whether the health check itself actually passed.
    await expect(async () => {
      await page.getByRole('button', { name: /^(Save & test|Test)$/ }).click();
      await expect(page.getByText('Data source is working')).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 30_000 });
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
  await expect(page.getByText('connect: connection refused')).toBeVisible();
});
