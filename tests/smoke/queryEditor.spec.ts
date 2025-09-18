import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';

test('should render query editor', async ({ page, panelEditPage, readProvisionedDashboard, gotoPanelEditPage }) => {
  await panelEditPage.datasource.set('AWS Athena');

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  // Change database selection for query
  const databaseSelector = await page.getByRole('combobox', { name: selectors.components.ConfigEditor.database.input });
  await expect(databaseSelector).toBeVisible();

  // Select a table from the explorer
  const tableSelector = await page.getByRole('combobox', { name: selectors.components.ConfigEditor.table.input });
  await expect(tableSelector).toBeVisible();

  const codeEditor = await panelEditPage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container);
  await expect(codeEditor).toBeVisible();
});
