import { DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { AthenaVariableSupport } from './variables';
import { filterQuery, applyTemplateVariables } from '@grafana/aws-sdk';

export class DataSource extends DataSourceWithBackend<AthenaQuery, AthenaDataSourceOptions> {
  defaultRegion = '';
  defaultCatalog = '';
  defaultDatabase = '';

  constructor(instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>) {
    super(instanceSettings);
    this.defaultRegion = instanceSettings.jsonData.defaultRegion || '';
    this.defaultCatalog = instanceSettings.jsonData.catalog || '';
    this.defaultDatabase = instanceSettings.jsonData.database || '';
    this.variables = new AthenaVariableSupport(this);
  }

  // This will support annotation queries for 7.2+
  annotations = {};

  filterQuery = filterQuery;

  applyTemplateVariables = (query: AthenaQuery, scopedVars: ScopedVars) =>
    applyTemplateVariables(query, scopedVars, getTemplateSrv);
}
