import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';
import { DatasourceWithAsyncBackend } from '@grafana/async-query-data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from '../src/types';
test('should render config editor', async ({ createDataSourceConfigPage, readProvisionedDataSource, page }) => {
  const datasource = await readProvisionedDataSource<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>({
    fileName: 'aws-athena.yaml',
    name: 'AWS Athena',
  });
  const { defaultRegion, catalog, database, workgroup } = datasource.jsonData;
  await createDataSourceConfigPage({ type: datasource.type });
  await expect(page.getByTestId('connection-config')).toBeVisible();
  await page.getByRole('combobox', { name: selectors.components.ConfigEditor.AuthenticationProvider.input }).click();
  await page.getByText('Access & secret key').click();
  if (datasource.secureJsonData?.accessKey && datasource.secureJsonData?.secretKey) {
    // Authenticate
    await page.getByLabel(selectors.components.ConfigEditor.AccessKey.input).fill(datasource.secureJsonData.accessKey);
    await page.getByLabel(selectors.components.ConfigEditor.SecretKey.input).fill(datasource.secureJsonData.secretKey);
  } else {
    throw new Error('Missing one of secureJsonData: accessKey, secretKey in the datasource');
  }
  expect(page.getByLabel(selectors.components.ConfigEditor.AccessKey.input)).toBeVisible();
  expect(page.getByLabel(selectors.components.ConfigEditor.SecretKey.input)).toBeVisible();
  if (defaultRegion && catalog && database && workgroup) {
    // Default region
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.DefaultRegion.input }).click();
    await page.getByText(defaultRegion).click();
    // Catalogs
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.catalog.input }).click();
    await page.getByText(catalog).click();
    // Databases
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.database.input }).click();
    await page.getByText(database).click();
    // Workgroups
    await page.getByRole('combobox', { name: selectors.components.ConfigEditor.workgroup.input }).click();
    await page.getByText(workgroup).click();
  } else {
    throw new Error('Missing one of default data: defaultRegion, catalog, database, workgroup in the datasource');
  }
});
