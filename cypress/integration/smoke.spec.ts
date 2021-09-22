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
          name: 'e2e-athena-datasource',
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
            // Catalogs
            e2eSelectors.ConfigEditor.catalog.input().click({ force: true });
            // wait for it to load
            e2eSelectors.ConfigEditor.catalog.wrapper().contains(datasource.jsonData.catalog);
            e2eSelectors.ConfigEditor.catalog.input().type(datasource.jsonData.catalog).type('{enter}');
            // Databases
            e2eSelectors.ConfigEditor.database.input().click({ force: true });
            // wait for it to load
            e2eSelectors.ConfigEditor.database.wrapper().contains(datasource.jsonData.database);
            e2eSelectors.ConfigEditor.database.input().type(datasource.jsonData.database).type('{enter}');
            // Workgroups
            e2eSelectors.ConfigEditor.workgroup.input().click({ force: true });
            // wait for it to load
            e2eSelectors.ConfigEditor.workgroup.wrapper().contains(datasource.jsonData.workgroup);
            e2eSelectors.ConfigEditor.workgroup.input().type(datasource.jsonData.workgroup).type('{enter}');
          },
          type: 'Athena data source for Grafana',
        });

        // TODO: https://github.com/grafana/grafana/issues/38683
        // then we can add a variable with addDashboard
        e2e.flows.addDashboard({
          timeRange: {
            from: '2021-09-08 00:00:00',
            to: '2021-09-08 12:00:00',
          },
          annotations: [
            {
              dataSource: 'e2e-athena-datasource',
              name: 'e2e test annotation',
              dataSourceForm: () => {
                e2eSelectors.QueryEditor.CodeEditor.container()
                  .click({ force: true })
                  .type(`{selectall} select * from cloudfront_logs where bytes < 100`);

                e2e()
                  .get('.filter-table')
                  .contains('time')
                  .parent()
                  .find('input')
                  .click({ force: true })
                  .type('date (time)')
                  .type('{enter}');
              },
            },
          ],
        });

        // TODO use $__timeFilter and $__timeGroup when available
        e2e.flows.addPanel({
          matchScreenshot: true,
          visitDashboardAtStart: false,
          queriesForm: () => {
            // Change database selection for query
            e2eSelectors.ConfigEditor.database.input().click({ force: true });
            e2eSelectors.ConfigEditor.database.wrapper().contains('cloudtrail');
            e2eSelectors.ConfigEditor.database.input().type('{selectall}cloudtrail{enter}');

            e2eSelectors.QueryEditor.CodeEditor.container().click({ force: true }).type(`{selectall}{enter}
SELECT 
    parse_datetime(eventtime,'yyyy-MM-dd''T''HH:mm:ss''Z') as time, 
    sum(cast(json_extract_scalar(additionaleventdata, '$.bytesTransferredOut') as real)) AS bytes 
FROM 
    cloudtrail_logs 
WHERE additionaleventdata IS NOT NULL AND json_extract_scalar(additionaleventdata, '$.bytesTransferredOut') IS NOT NULL 
AND 
    parse_datetime(eventtime,'yyyy-MM-dd''T''HH:mm:ss''Z') 
      BETWEEN 
        parse_datetime('2021-09-08 00:00:00','yyyy-MM-dd HH:mm:ss') 
        AND parse_datetime('2021-09-08 12:00:00','yyyy-MM-dd HH:mm:ss') 
GROUP BY 1 
ORDER BY 1 
`);
            // blur and wait for loading
            cy.get('.panel-content').click();
            cy.get('.panel-loading');
            cy.get('.panel-loading', { timeout: 10000 }).should('not.exist');
          },
        });

        e2e.flows.importDashboard(TEST_DASHBOARD);
      });
  },
});
