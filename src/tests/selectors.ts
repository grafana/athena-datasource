import { E2ESelectors } from '@grafana/e2e-selectors';

export const Components = {
  ConfigEditor: {
    SecretKey: {
      input: 'Config editor secret key input',
    },
    AccessKey: {
      input: 'Config editor access key input',
    },
    catalog: {
      input: 'Catalog (datasource)',
      wrapper: 'data-testid onloadcatalog',
    },
    database: {
      input: 'Database',
      wrapper: 'data-testid onloaddatabase',
    },
    workgroup: {
      input: 'Workgroup',
      wrapper: 'data-testid onloadworkgroup',
    },
    region: {
      input: 'Region',
      wrapper: 'data-testid onloadregion',
    },
  },
  QueryEditor: {
    CodeEditor: {
      container: 'Code editor container',
    },
  },
  RefreshPicker: {
    runButton: 'RefreshPicker run button',
  },
};

export const selectors: { components: E2ESelectors<typeof Components> } = {
  components: Components,
};
