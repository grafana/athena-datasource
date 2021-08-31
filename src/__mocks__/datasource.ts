import { DataSourcePluginOptionsEditorProps, PluginType } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData, AthenaQuery } from '../types';
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
    password: '',
    user: '',
    basicAuth: false,
    basicAuthPassword: '',
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
  rawSQL: 'select 1',
  refId: '',
  connectionArgs: { region: 'default', catalog: 'default', database: 'default' },
};
