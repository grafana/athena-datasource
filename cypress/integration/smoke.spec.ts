import { e2e } from '@grafana/e2e';
import { selectors } from '../../src/tests/selectors';

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
            e2eSelectors.ConfigEditor.Catalog.input().type(datasource.jsonData.catalog);
            e2eSelectors.ConfigEditor.Database.input().type(datasource.jsonData.database);
            e2eSelectors.ConfigEditor.Workgroup.input().type(datasource.jsonData.workgroup);
          },
          type: 'athena-datasource',
        });

      });
  },
});
