import { DataSourcePluginOptionsEditorProps, PluginType } from '@grafana/data';
import {
  AthenaDataSourceOptions,
  AthenaDataSourceSecureJsonData,
  AthenaQuery,
  defaultKey,
  DEFAULT_RESULT_REUSE_ENABLED,
  DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES,
} from '../types';
import { DataSource } from '../datasource';

export const mockDatasourceOptions: DataSourcePluginOptionsEditorProps<
  AthenaDataSourceOptions,
  AthenaDataSourceSecureJsonData
> = {
  options: {
    id: 1,
    uid: 'athena-id',
    orgId: 1,
    name: 'Athena Data source',
    typeLogoUrl: '',
    type: '',
    typeName: '',
    access: '',
    url: '',
    user: '',
    basicAuth: false,
    basicAuthUser: '',
    database: '',
    isDefault: false,
    jsonData: {
      defaultRegion: 'us-east-2',
    },
    secureJsonFields: {},
    readOnly: false,
    withCredentials: false,
  },
  onOptionsChange: jest.fn(),
};

export const mockDatasource = new DataSource({
  id: 1,
  uid: 'athena-id',
  type: 'athena-datasource',
  name: 'Athena Data Source',
  access: 'proxy',
  readOnly: false,
  jsonData: {
    defaultRegion: 'us-east-2',
    catalog: 'aws-catalog',
    database: 'db',
  },
  meta: {
    id: 'athena-datasource',
    name: 'Athena Data Source',
    type: PluginType.datasource,
    module: '',
    baseUrl: '',
    info: {
      description: '',
      screenshots: [],
      updated: '',
      version: '',
      logos: {
        small: '',
        large: '',
      },
      author: {
        name: '',
      },
      links: [],
    },
  },
});

export const mockQuery: AthenaQuery = {
  connectionArgs: {
    region: defaultKey,
    catalog: defaultKey,
    database: defaultKey,
    resultReuseEnabled: DEFAULT_RESULT_REUSE_ENABLED,
    resultReuseMaxAgeInMinutes: DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES,
  },
  format: 1,
  rawSQL: 'SELECT * FROM table',
  refId: '',
  table: undefined,
  column: undefined,
};
