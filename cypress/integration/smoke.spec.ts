import { e2e } from '@grafana/e2e';

import { selectors } from '../../src/tests/selectors';
import TEST_DASHBOARD from './testDashboard.json';

const e2eSelectors = e2e.getSelectors(selectors.components);

/*
To run these e2e tests:
- first make sure you have access to the internal grafana athena cluster
- set up a copy of your credentials in a provisioning/datasource/aws-athena.yaml file
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

const dataSourceName = 'e2e-athena-datasource';

e2e.scenario({
  describeName: 'Smoke tests',
  itName: 'Login, create data source, dashboard with panel',
  scenario: () => {
    e2e()
      .readProvisions(['datasources/aws-athena.yaml'])
      .then((AthenaProvisions: AthenaProvision[]) => {
        const datasource = AthenaProvisions[0].datasources[0];

        e2e.flows.addDataSource({
          name: dataSourceName,
          expectedAlertMessage: 'Data source is working',
          form: () => {
            cy.contains('label', selectors.components.ConfigEditor.AuthenticationProvider.input)
              .click({ force: true })
              .type('Access & secret key{enter}');
            cy.contains('label', selectors.components.ConfigEditor.AccessKey.input).type(
              datasource.secureJsonData.accessKey
            );
            cy.contains('label', selectors.components.ConfigEditor.SecretKey.input).type(
              datasource.secureJsonData.secretKey
            );
            cy.contains('label', selectors.components.ConfigEditor.DefaultRegion.input)
              .click({ force: true })
              .type(`${datasource.jsonData.defaultRegion}{enter}`);
            // Catalogs
            e2eSelectors.ConfigEditor.catalog.input().click({ force: true });
            // wait for it to load
            e2eSelectors.ConfigEditor.catalog.wrapper().contains(datasource.jsonData.catalog);
            e2eSelectors.ConfigEditor.catalog.input().type(datasource.jsonData.catalog).type('{enter}');
            // Databases
            e2eSelectors.ConfigEditor.database.input().click({ force: true });
            // wait for it to load
            e2e().contains(datasource.jsonData.database);
            e2eSelectors.ConfigEditor.database.input().type(datasource.jsonData.database).type('{enter}');
            // Workgroups
            e2eSelectors.ConfigEditor.workgroup.input().click({ force: true });
            // wait for it to load
            e2eSelectors.ConfigEditor.workgroup.wrapper().contains(datasource.jsonData.workgroup);
            e2eSelectors.ConfigEditor.workgroup.input().type(datasource.jsonData.workgroup).type('{enter}');
          },
          type: 'Amazon Athena',
        });

        // TODO: https://github.com/grafana/grafana/issues/38683
        // then we can add a variable with addDashboard
        e2e.flows.addDashboard({
          timeRange: {
            from: '2021-09-08 00:00:00',
            to: '2021-09-08 12:00:00',
          },
        });

        e2e.components.PageToolbar.item('Dashboard settings').click();
        e2e.components.Tab.title('Annotations').click();
        e2e.pages.Dashboard.Settings.Annotations.List.addAnnotationCTAV2().click();

        // Wait for the monaco editor to finish lazy loading
        const monacoLoadingText = 'Loading...';
        e2eSelectors.QueryEditor.CodeEditor.container().should('be.visible').should('have.text', monacoLoadingText);
        e2eSelectors.QueryEditor.CodeEditor.container().should('be.visible').should('not.have.text', monacoLoadingText);

        e2e.pages.Dashboard.Settings.Annotations.Settings.name().clear().type('e2e test annotation');
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
        cy.get('button').contains('Close').click();

        e2e.flows.addPanel({
          visitDashboardAtStart: false,
          dataSourceName,
          queriesForm: () => {
            // Change database selection for query
            e2eSelectors.ConfigEditor.database.input().click({ force: true });
            // TODO fix the ResourceSelector to load the list of databases when clicked
            // e2e().contains('cloudtrail');
            e2eSelectors.ConfigEditor.database.input().type('{selectall}cloudtrail{enter}');

            // Select a table from the explorer
            e2eSelectors.ConfigEditor.table.input().click({ force: true });
            e2eSelectors.ConfigEditor.table.wrapper().contains('cloudtrail_logs');
            e2eSelectors.ConfigEditor.table.input().type('cloudtrail_logs').type('{enter}');

            // The follwing section will verify that autocompletion in behaving as expected.
            // Throughout the composition of the SQL query, the autocompletion engine will provide appropriate suggestions.
            // In this test the first few suggestions are accepted by hitting enter which will create a basic query.
            // Increasing delay to allow tables names and columns names to be resolved async by the plugin
            e2eSelectors.QueryEditor.CodeEditor.container()
              .click({ force: true })
              .type(`s{enter}{enter}{enter}{enter} {enter}{enter}`, { delay: 3000 });
            e2eSelectors.QueryEditor.CodeEditor.container().contains(
              'SELECT * FROM cloudtrail_logs GROUP BY additionaleventdata'
            );

            e2eSelectors.QueryEditor.CodeEditor.container()
              .click({ force: true })
              .type(
                `{selectall}
SELECT $__parseTime(eventtime, 'yyyy-MM-dd''T''HH:mm:ss''Z'), sum(cast(json_extract_scalar(additionaleventdata, '$.bytesTransferredOut') as real)) AS bytes 
FROM $__table WHERE additionaleventdata IS NOT NULL AND json_extract_scalar(additionaleventdata, '$.bytesTransferredOut') IS NOT NULL AND  $__timeFilter(eventtime, 'yyyy-MM-dd''T''HH:mm:ss''Z') 
GROUP BY 1 
ORDER BY 1 
`
              );
            // click run and wait for loading
            cy.contains('button', 'Run').click();
            cy.get('[aria-label="Panel loading bar"]');
            cy.get('[aria-label="Panel loading bar"]', { timeout: 10000 }).should('not.exist');

            e2eSelectors.QueryEditor.TableView.input().click({ force: true });
            // check that the table content contains at least an entry
            cy.get('div[role="table"]').should('include.text', '2021');
          },
        });

        e2e.flows.importDashboard(TEST_DASHBOARD);
      });
  },
});
