import { test, expect } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';

test('should render query editor', async ({ panelEditPage }) => {
  const regionSelector = selectors.components.ConfigEditor.region.wrapper;
  await panelEditPage.datasource.set('AWS Athena');
  await expect(panelEditPage.getQueryEditorRow('A').getByTestId(regionSelector)).toBeVisible();
});
