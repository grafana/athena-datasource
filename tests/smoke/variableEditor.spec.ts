import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../../src/tests/selectors';

test('should render variable editor', async ({ variableEditPage, page }) => {
  const regionSelector = selectors.components.ConfigEditor.region.wrapper;
  await variableEditPage.datasource.set('AWS Athena');
  await expect(page.getByTestId(regionSelector)).toBeVisible();
});
