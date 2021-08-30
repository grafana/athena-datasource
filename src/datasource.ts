import { DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { AthenaDataSourceOptions, AthenaQuery } from './types';

export class DataSource extends DataSourceWithBackend<AthenaQuery, AthenaDataSourceOptions> {
  defaultRegion = '';
  defaultCatalog = '';

  constructor(instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>) {
    super(instanceSettings);
    this.defaultRegion = instanceSettings.jsonData.defaultRegion || '';
    this.defaultCatalog = instanceSettings.jsonData.catalog || '';
  }
}
