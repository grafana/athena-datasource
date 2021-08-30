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
              .type(`{selectall} select time as time, bytes as bytes from cloudfront_logs limit 2`);
            // TODO: we should be able to just pass visualizationName: "Table" to addPanel
            // but it doesn't seem to work for some reason, maybe make a ticket in core grafana
            e2e().get('[aria-label="toggle-viz-picker"]').click({ force: true });
            e2e().get('[aria-label="Plugin visualization item Table"]').click({ force: true });
            e2e().wait(3000);
          },
        });

        // TODO:
        // - deploy https://github.com/grafana/grafana/pull/38685 and publish a new version of grafana and then import that version
        // once that is done you can uncomment out the following:
        // e2e.flows.importDashboard(TEST_DASHBOARD, { queryWaitTime: 10000 })
      });
  },
});

// const TEST_DASHBOARD = {
//   annotations: {
//     list: [
//       {
//         builtIn: 1,
//         datasource: '-- Grafana --',
//         enable: true,
//         hide: true,
//         iconColor: 'rgba(0, 211, 255, 1)',
//         name: 'Annotations & Alerts',
//         target: {
//           limit: 100,
//           matchAny: false,
//           tags: [],
//           type: 'dashboard',
//         },
//         type: 'dashboard',
//       },
//     ],
//   },
//   editable: true,
//   gnetId: null,
//   graphTooltip: 0,
//   id: 242,
//   iteration: 1630287517748,
//   links: [],
//   panels: [
//     {
//       datasource: 'athena-datasource',
//       fieldConfig: {
//         defaults: {
//           color: {
//             mode: 'thresholds',
//           },
//           custom: {
//             align: 'auto',
//             displayMode: 'auto',
//           },
//           mappings: [],
//           thresholds: {
//             mode: 'absolute',
//             steps: [
//               {
//                 color: 'green',
//                 value: null,
//               },
//               {
//                 color: 'red',
//                 value: 80,
//               },
//             ],
//           },
//         },
//         overrides: [],
//       },
//       gridPos: {
//         h: 9,
//         w: 12,
//         x: 0,
//         y: 0,
//       },
//       id: 2,
//       options: {
//         showHeader: true,
//       },
//       pluginVersion: '8.1.0-pre',
//       targets: [
//         {
//           azureMonitor: {
//             timeGrain: 'auto',
//           },
//           format: 1,
//           queryType: 'Azure Monitor',
//           rawSQL:
//             "SELECT location, time\nFROM $tablename\nWHERE date BETWEEN date '2014-07-05' AND date $endingdate\nLIMIT $LimitNum",
//           refId: 'A',
//         },
//       ],
//       title: 'Panel Title',
//       type: 'table',
//     },
//   ],
//   refresh: '',
//   schemaVersion: 30,
//   style: 'dark',
//   tags: [],
//   templating: {
//     list: [
//       {
//         allValue: null,
//         current: {
//           selected: true,
//           text: '2',
//           value: '2',
//         },
//         description: null,
//         error: null,
//         hide: 0,
//         includeAll: false,
//         label: null,
//         multi: false,
//         name: 'LimitNum',
//         options: [
//           {
//             selected: true,
//             text: '2',
//             value: '2',
//           },
//           {
//             selected: false,
//             text: '3',
//             value: '3',
//           },
//           {
//             selected: false,
//             text: '4',
//             value: '4',
//           },
//           {
//             selected: false,
//             text: '5',
//             value: '5',
//           },
//           {
//             selected: false,
//             text: '6',
//             value: '6',
//           },
//         ],
//         query: '2, 3, 4, 5, 6',
//         queryValue: '',
//         skipUrlSync: false,
//         type: 'custom',
//       },
//       {
//         allValue: null,
//         current: {
//           selected: true,
//           text: 'cloudfront_logs',
//           value: 'cloudfront_logs',
//         },
//         description: null,
//         error: null,
//         hide: 0,
//         includeAll: false,
//         label: null,
//         multi: false,
//         name: 'tablename',
//         options: [
//           {
//             selected: true,
//             text: 'cloudfront_logs',
//             value: 'cloudfront_logs',
//           },
//         ],
//         query: 'cloudfront_logs',
//         queryValue: '',
//         skipUrlSync: false,
//         type: 'custom',
//       },
//       {
//         allValue: null,
//         current: {
//           selected: false,
//           text: "'2014-08-05'",
//           value: "'2014-08-05'",
//         },
//         description: null,
//         error: null,
//         hide: 0,
//         includeAll: false,
//         label: null,
//         multi: false,
//         name: 'endingdate',
//         options: [
//           {
//             selected: true,
//             text: "'2014-08-05'",
//             value: "'2014-08-05'",
//           },
//         ],
//         query: "'2014-08-05'",
//         queryValue: '',
//         skipUrlSync: false,
//         type: 'custom',
//       },
//       {
//         allValue: null,
//         current: {
//           selected: true,
//           text: 'EWR2',
//           value: 'EWR2',
//         },
//         datasource: 'athena-datasource',
//         definition: '',
//         description: null,
//         error: null,
//         hide: 0,
//         includeAll: false,
//         label: null,
//         multi: false,
//         name: 'locationsFromCloudFrontLogs',
//         options: [],
//         query: {
//           format: 1,
//           rawSQL: 'select distinct location from cloudfront_logs',
//         },
//         refresh: 1,
//         regex: '',
//         skipUrlSync: false,
//         sort: 0,
//         type: 'query',
//       },
//     ],
//   },
//   time: {
//     from: 'now-6h',
//     to: 'now',
//   },
//   timepicker: {},
//   timezone: '',
//   title: 'e2e athena dashboard',
//   uid: 'NCL2o74nk',
//   version: 3,
// };
