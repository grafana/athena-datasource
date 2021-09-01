import { e2e } from '@grafana/e2e';
import { selectors } from '../../src/tests/selectors';
import TEST_DASHBOARD from './testDashboard.json';

const e2eSelectors = e2e.getSelectors(selectors.components);

/**
To run these e2e tests:
- first make sure you have access to the internal grafana athena cluster
- set up a copy of your credentials in a provisioning/datasource/athena.yaml file
*/

type AthenaDatasourceConfig = {
  secureJsonData: {
    accessKey: string;
    secretKey: string;
  };
  jsonData: {
    defaultRegion: string;
    catalog: string;
    database: string;
    workgroup: string;
  };
};
type AthenaProvision = {
  datasources: AthenaDatasourceConfig[];
};

e2e.scenario({
  describeName: 'Smoke tests',
  itName: 'Login, create data source, dashboard with panel',
  scenario: () => {
    e2e()
      .readProvisions(['datasources/athena.yaml'])
      .then((AthenaProvisions: AthenaProvision[]) => {
        const datasource = AthenaProvisions[0].datasources[0];

        e2e.flows.addDataSource({
          checkHealth: false,
          expectedAlertMessage: 'Data source is working',
          form: () => {
            e2e()
              .get('.aws-config-authType')
              .find(`input`)
              .click({ force: true })
              .type('Access & secret key')
              .type('{enter}');
            e2eSelectors.ConfigEditor.AccessKey.input().type(datasource.secureJsonData.accessKey);
            e2eSelectors.ConfigEditor.SecretKey.input().type(datasource.secureJsonData.secretKey);
            e2e()
              .get('.aws-config-defaultRegion')
              .find(`input`)
              .click({ force: true })
              .type(datasource.jsonData.defaultRegion)
              .type('{enter}');
            e2eSelectors.ConfigEditor.Catalog.input().click({ force: true });
            // wait for the catalogs to load
            e2e().get('[data-testid="onloadcatalogs"]').contains(datasource.jsonData.catalog);
            e2eSelectors.ConfigEditor.Catalog.input().type(datasource.jsonData.catalog).type('{enter}');
            e2eSelectors.ConfigEditor.Database.input().type(datasource.jsonData.database);
            e2eSelectors.ConfigEditor.Workgroup.input().type(datasource.jsonData.workgroup);
          },
          type: 'athena-datasource',
        });

        // TODO: https://github.com/grafana/grafana/issues/38683
        // then we can add a variable with addDashboard
        e2e.flows.addDashboard({
          timeRange: {
            from: '2008-01-01 19:00:00',
            to: '2008-01-02 19:00:00',
          },
        });

        // TODO change this to a time series once $__timeFilter is working
        e2e.flows.addPanel({
          matchScreenshot: false,
          visitDashboardAtStart: false,
          queriesForm: () => {
            e2eSelectors.QueryEditor.CodeEditor.container()
              .click({ force: true })
              .type(`{selectall} select time, bytes from cloudfront_logs limit 2`);
            // TODO: we should be able to just pass visualizationName: "Table" to addPanel
            // but it doesn't seem to work for some reason, maybe make a ticket in core grafana
            e2e().get('[aria-label="toggle-viz-picker"]').click({ force: true });
            e2e().get('[aria-label="Plugin visualization item Table"]').click({ force: true });
            e2e().wait(3000);
          },
        });

        e2e.flows.importDashboard(TEST_DASHBOARD);
      });
  },
});
