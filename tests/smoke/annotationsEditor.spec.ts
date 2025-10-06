import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';

test('should render annotations editor', async ({ annotationEditPage, page }) => {
  await annotationEditPage.datasource.set('AWS Athena');

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  const codeEditor = await annotationEditPage.getByGrafanaSelector(
    selectors.components.QueryEditor.CodeEditor.container
  );
  await expect(codeEditor).toBeVisible();
});
