import type { PluginOptions } from '@grafana/plugin-e2e';
import { defineConfig } from '@playwright/test';
import playwrightConfig from './playwright.config';

// Separate config/testDir for the Scheduled Cloud end-to-end lane (see cron.yml), so these
// tests never get swept up by the default `npm run e2e` (which targets ./tests and is used by
// the PR-triggered local Docker lane against a different, unrelated AWS account).
export default defineConfig<PluginOptions>({
  ...playwrightConfig,
  testDir: './tests-cloud',
});
