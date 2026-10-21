import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from '../../src/types';

test('should render config editor', async ({ gotoDataSourceConfigPage, readProvisionedDataSource, page }) => {
  test.setTimeout(90_000);

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

  // The health check calls GetWorkGroup, which AWS throttles under concurrent CI load.
  await expect(async () => {
    await expect(configPage.saveAndTest()).toBeOK();
  }).toPass({ timeout: 30_000, intervals: [1_000, 2_000, 5_000] });
});
