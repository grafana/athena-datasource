import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { AthenaQuery, AthenaDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, AthenaQuery, AthenaDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
