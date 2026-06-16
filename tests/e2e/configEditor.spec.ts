import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from '../../src/types';

test('should render config editor', async ({ gotoDataSourceConfigPage, readProvisionedDataSource, page }) => {
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
});
