import { E2ESelectors } from '@grafana/e2e-selectors';

export const Components = {
  ConfigEditor: {
    SecretKey: {
      input: 'Config editor secret key input',
    },
    AccessKey: {
      input: 'Config editor access key input',
    },
    Catalog: {
      input: 'data-testid-catalog',
    },
    Database: {
      input: 'data-testid-database',
    },
    Workgroup: {
      input: 'data-testid-workgroup',
    },
  },
};

export const selectors: { components: E2ESelectors<typeof Components> } = {
  components: Components,
};
