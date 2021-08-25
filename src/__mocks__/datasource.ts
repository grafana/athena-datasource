import { PluginType } from '@grafana/data';
import { AthenaQuery } from '../types';
import { DataSource } from '../datasource';

export const mockDatasource = new DataSource({
  id: 1,
  uid: 'athena-id',
  type: 'athena-datasource',
  name: 'Athena Data Source',
  jsonData: {
    defaultRegion: 'us-east-2',
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

export const mockQuery: AthenaQuery = { rawSQL: 'select 1', refId: '', connectionArgs: { region: '' } };
