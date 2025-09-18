import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';

test('should render query editor', async ({ page, panelEditPage, readProvisionedDashboard, gotoPanelEditPage }) => {
  await panelEditPage.datasource.set('AWS Athena');

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  // Change database selection for query
  await page.getByRole('combobox', { name: selectors.components.ConfigEditor.database.input }).click();
  await page.getByText('cloudtrail').click();

  // Select a table from the explorer
  await page.getByRole('combobox', { name: selectors.components.ConfigEditor.table.input }).click();
  await page.getByText('cloudtrail_logs', { exact: true }).click();

  // The following section will verify that autocompletion in behaving as expected.
  // Throughout the composition of the SQL query, the autocompletion engine will provide appropriate suggestions.
  // In this test the first few suggestions are accepted by hitting enter which will create a basic query.
  // Increasing delay to allow tables names and columns names to be resolved async by the plugin
  await panelEditPage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container).click();
  await page.keyboard.press('s', { delay: 1000 });
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Enter', { delay: 1000 });
  }
  expect(panelEditPage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container)).toContainText(
    'SELECT * FROM cloudtrail_logs GROUP BY additionaleventdata'
  );

  // check that a query returns 200
  await panelEditPage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard
    .insertText(`SELECT $__parseTime(eventtime, 'yyyy-MM-dd''T''HH:mm:ss''Z'), sum(cast(json_extract_scalar(additionaleventdata, '$.bytesTransferredOut') as real)) AS bytes 
FROM $__table WHERE additionaleventdata IS NOT NULL AND json_extract_scalar(additionaleventdata, '$.bytesTransferredOut') IS NOT NULL AND  $__timeFilter(eventtime, 'yyyy-MM-dd''T''HH:mm:ss''Z') 
GROUP BY 1 
ORDER BY 1`);
  await expect(panelEditPage.refreshPanel()).toBeOK();

  // test provisioned dashboards
  const dashboard = await readProvisionedDashboard({ fileName: 'testDashboard.json' });
  const panel1 = await gotoPanelEditPage({ dashboard, id: '2' });
  await expect(panel1.refreshPanel()).toBeOK();
});
