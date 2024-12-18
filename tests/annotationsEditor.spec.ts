import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';

test('should render annotations editor', async ({ annotationEditPage, page }) => {
  const regionSelector = selectors.components.ConfigEditor.region.wrapper;
  await annotationEditPage.datasource.set('AWS Athena');
  await expect(page.getByTestId(regionSelector)).toBeVisible();
});
