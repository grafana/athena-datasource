import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from '../src/types';
test('should render config editor', async ({ createDataSourceConfigPage, readProvisionedDataSource, page }) => {
  test('fills out datasource connection configuration', async ({
    createDataSourceConfigPage,
    gotoDataSourceConfigPage,
    page,
    readProvisionedDataSource,
  }) => {
    const datasource = await readProvisionedDataSource<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>({
      fileName: 'aws-athena.yaml',
      name: 'AWS Athena',
    });
    const configPage = await gotoDataSourceConfigPage(datasource.uid);
    await expect(configPage.saveAndTest()).toBeOK();
  });
});
