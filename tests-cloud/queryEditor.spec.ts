import { expect, test } from '@grafana/plugin-e2e';
import { selectors } from '../src/tests/selectors';

// Runs against the shared DSE2EDEV Grafana Cloud stack (see docs/testing/cloud-e2e-testing.md
// in the data-sources repo), using the "Athena (PDC)" data source that's already provisioned
// there by Pulumi (infra/data-sources/aws/athena.ts). That data source's default database
// (datasourcesathenadb) has an `access_logs` table continuously seeded by the Athena data
// generator on a ~15-minute cadence (see grafana/data-sources#1625) -- there's no local docker
// provisioning file to read here, so the data source is looked up by name via the Grafana UI
// instead of readProvisionedDataSource.
const ATHENA_DATASOURCE_NAME = 'Athena (PDC)';

test('should run a real query against Athena in DSE2EDEV', async ({ explorePage, page }) => {
  // The toPass() block below can take up to 30s if Athena's GetWorkGroup API is throttled,
  // which would exceed Playwright's default 30s per-test timeout on its own -- extend the test
  // timeout so a slow-but-successful retry isn't cut off by the outer test deadline.
  test.setTimeout(90_000);

  await explorePage.goto();
  await explorePage.datasource.set(ATHENA_DATASOURCE_NAME);

  // Wait for the monaco editor to finish lazy loading
  await page.waitForFunction(() => window.monaco);

  await explorePage.getByGrafanaSelector(selectors.components.QueryEditor.CodeEditor.container).click();
  await page.keyboard.insertText(
    `select date, sum(received_bytes) as bytes from access_logs group by 1 order by 1 limit 10`
  );

  // Athena's GetWorkGroup API is occasionally throttled (ThrottlingException: Rate exceeded) under
  // concurrent CI load against the shared DSE2EDEV AWS account. The query itself succeeds within
  // seconds on retry, so retry the run-query action rather than failing on a single throttled
  // response. Use a slower backoff than toPass()'s default (100ms) so retries don't add to the
  // rate-limit pressure that caused the throttling in the first place.
  await expect(async () => {
    await expect(explorePage.runQuery()).toBeOK();
  }).toPass({ timeout: 30_000, intervals: [1_000, 2_000, 5_000] });
});
