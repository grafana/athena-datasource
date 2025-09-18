import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from '../../src/types';

test('should render config editor', async ({ gotoDataSourceConfigPage, readProvisionedDataSource, page }) => {
  const datasource = await readProvisionedDataSource<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>({
    fileName: 'aws-athena.yaml',
    name: 'AWS Athena',
  });
  await gotoDataSourceConfigPage(datasource.uid);

  // Default region
  const regionSelector = await page.getByRole('combobox', {
    name: selectors.components.ConfigEditor.DefaultRegion.input,
  });
  await expect(regionSelector).toBeVisible();
  // Catalogs
  const catalogSelector = await page.getByRole('combobox', { name: selectors.components.ConfigEditor.catalog.input });
  await expect(catalogSelector).toBeVisible();
  // Databases
  const databaseSelector = await page.getByRole('combobox', { name: selectors.components.ConfigEditor.database.input });
  await expect(databaseSelector).toBeVisible();
  // Workgroups
  const workgroupSelector = await page.getByRole('combobox', {
    name: selectors.components.ConfigEditor.workgroup.input,
  });
  await expect(workgroupSelector).toBeVisible();
});
