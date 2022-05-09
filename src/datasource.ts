import { DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv, TemplateSrv } from '@grafana/runtime';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { AthenaVariableSupport } from './variables';
import { filterSQLQuery, applySQLTemplateVariables } from '@grafana/aws-sdk';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { appendTemplateVariables } from 'utils';

export class DataSource extends DataSourceWithBackend<AthenaQuery, AthenaDataSourceOptions> {
  defaultRegion = '';
  defaultCatalog = '';
  defaultDatabase = '';

  constructor(
    instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings);
    this.defaultRegion = instanceSettings.jsonData.defaultRegion || '';
    this.defaultCatalog = instanceSettings.jsonData.catalog || '';
    this.defaultDatabase = instanceSettings.jsonData.database || '';
    this.variables = new AthenaVariableSupport(this);
  }

  // This will support annotation queries for 7.2+
  annotations = {};

  filterQuery = filterSQLQuery;

  applyTemplateVariables = (query: AthenaQuery, scopedVars: ScopedVars) =>
    applySQLTemplateVariables(query, scopedVars, getTemplateSrv);

  getVariables = () => this.templateSrv.getVariables().map((v) => `$${v.name}`);

  getRegions = () => this.getResource('regions').then((regions) => appendTemplateVariables(this, regions));

  getCatalogs = (query: AthenaQuery) =>
    this.postResource('catalogs', {
      region: this.templateSrv.replace(query.connectionArgs.region),
    }).then((catalogs) => appendTemplateVariables(this, catalogs));

  getDatabases = (query: AthenaQuery) =>
    this.postResource('databases', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
    }).then((databases) => appendTemplateVariables(this, databases));

  getTables = (query: AthenaQuery) =>
    this.postResource('tables', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
      database: this.templateSrv.replace(query.connectionArgs.database),
    }).then((tables) => appendTemplateVariables(this, tables));

  getColumns = (query: AthenaQuery) =>
    this.postResource('columns', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
      database: this.templateSrv.replace(query.connectionArgs.database),
      table: this.templateSrv.replace(query.table),
    }).then((columns) => appendTemplateVariables(this, columns));

  query(options: DataQueryRequest<AthenaQuery>): Observable<DataQueryResponse> {
    options = cloneDeep(options);

    const queries = options.targets.filter((item) => item.hide !== true);

    const updatedQueries = queries.map((query) => {
      query.connectionArgs.region = this.templateSrv.replace(query.connectionArgs.region, options.scopedVars);
      query.connectionArgs.catalog = this.templateSrv.replace(query.connectionArgs.catalog, options.scopedVars);
      query.connectionArgs.database = this.templateSrv.replace(query.connectionArgs.database, options.scopedVars);
      query.table = this.templateSrv.replace(query.table, options.scopedVars);
      query.column = this.templateSrv.replace(query.column, options.scopedVars);
      return query;
    });

    options.targets = updatedQueries;

    return super.query(options);
  }
}
