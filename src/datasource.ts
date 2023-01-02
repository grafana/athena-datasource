import { DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { config, getTemplateSrv, TemplateSrv } from '@grafana/runtime';
import { AthenaDataSourceOptions, AthenaQuery, defaultKey, FormatOptions } from './types';
import { AthenaVariableSupport } from './variables';
import { filterSQLQuery, applySQLTemplateVariables } from '@grafana/aws-sdk';
import { DatasourceWithAsyncBackend } from '@grafana/async-query-data';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

export class DataSource extends DatasourceWithAsyncBackend<AthenaQuery, AthenaDataSourceOptions> {
  defaultRegion = '';
  defaultCatalog = '';
  defaultDatabase = '';

  constructor(
    instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings, config.featureToggles.athenaAsyncQueryDataSupport);
    this.defaultRegion = instanceSettings.jsonData.defaultRegion || '';
    this.defaultCatalog = instanceSettings.jsonData.catalog || '';
    this.defaultDatabase = instanceSettings.jsonData.database || '';
    this.variables = new AthenaVariableSupport(this);
  }

  // This will support annotation queries for 7.2+
  annotations = {};

  filterQuery(target: AthenaQuery) {
    return target.hide !== true && filterSQLQuery(target);
  }

  applyTemplateVariables = (query: AthenaQuery, scopedVars: ScopedVars) =>
    applySQLTemplateVariables(query, scopedVars, getTemplateSrv);

  getVariables = () => this.templateSrv.getVariables().map((v) => `$${v.name}`);

  getRegions = () => this.getResource('regions');

  getCatalogs = (query: AthenaQuery) =>
    this.postResource('catalogs', {
      region: this.templateSrv.replace(query.connectionArgs.region),
    });

  getDatabases = (query: AthenaQuery) =>
    this.postResource('databases', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
    });

  getTables = (query: AthenaQuery) =>
    this.postResource('tables', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
      database: this.templateSrv.replace(query.connectionArgs.database),
    });

  getColumns = (query: AthenaQuery) =>
    this.postResource('columns', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
      database: this.templateSrv.replace(query.connectionArgs.database),
      table: this.templateSrv.replace(query.table),
    });

  buildQuery(options: DataQueryRequest<AthenaQuery>, queries: AthenaQuery[]): AthenaQuery[] {
    const updatedQueries = queries.map((query) => {
      query.connectionArgs.region = this.templateSrv.replace(query.connectionArgs.region, options.scopedVars);
      query.connectionArgs.catalog = this.templateSrv.replace(query.connectionArgs.catalog, options.scopedVars);
      query.connectionArgs.database = this.templateSrv.replace(query.connectionArgs.database, options.scopedVars);
      query.table = query.table ? this.templateSrv.replace(query.table, options.scopedVars) : undefined;
      query.column = query.column ? this.templateSrv.replace(query.column, options.scopedVars) : undefined;
      return query;
    });

    return updatedQueries;
  }

  query(options: DataQueryRequest<AthenaQuery>): Observable<DataQueryResponse> {
    options = cloneDeep(options);

    const queries = options.targets.filter((item) => item.hide !== true);

    options.targets = this.buildQuery(options, queries);

    return super.query(options);
  }

  getDefaultQuery(): Partial<AthenaQuery> {
    console.log('default query');
    return {
      format: FormatOptions.Table,
      rawSQL: '',
      connectionArgs: {
        region: defaultKey,
        catalog: defaultKey,
        database: defaultKey,
      },
    };
  }
}
