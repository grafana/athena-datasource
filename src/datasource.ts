import { DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { getTemplateSrv, TemplateSrv } from '@grafana/runtime';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { AthenaVariableSupport } from './variables';
import { filterSQLQuery, applySQLTemplateVariables } from '@grafana/aws-sdk';
import { DatasourceWithAsyncBackend } from '@grafana/async-query-data';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { annotationSupport } from './annotationSupport';

export class DataSource extends DatasourceWithAsyncBackend<AthenaQuery, AthenaDataSourceOptions> {
  defaultRegion = '';
  defaultCatalog = '';
  defaultDatabase = '';
  workgroup = '';
  resultReuseSupported: boolean | undefined;

  constructor(
    instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings);
    this.defaultRegion = instanceSettings.jsonData.defaultRegion || '';
    this.defaultCatalog = instanceSettings.jsonData.catalog || '';
    this.defaultDatabase = instanceSettings.jsonData.database || '';
    this.workgroup = instanceSettings.jsonData.workgroup || '';
    this.variables = new AthenaVariableSupport(this);
  }

  async isResultReuseSupported() {
    if (!this.workgroup) {
      return false;
    }

    if (this.resultReuseSupported !== undefined) {
      return this.resultReuseSupported;
    }

    const version = await this.getWorkgroupEngineVersion();
    this.resultReuseSupported = this.workgroupEngineSupportsResultReuse(version);

    return this.resultReuseSupported;
  }

  workgroupEngineSupportsResultReuse(version: string) {
    return version !== 'Athena engine version 2';
  }

  annotations = annotationSupport;

  filterQuery(target: AthenaQuery) {
    return target.hide !== true && filterSQLQuery(target);
  }

  applyTemplateVariables = (query: AthenaQuery, scopedVars: ScopedVars) =>
    applySQLTemplateVariables(query, scopedVars, getTemplateSrv);

  getVariables = () => this.templateSrv.getVariables().map((v) => `$${v.name}`);

  getRegions = () => this.getResource('regions');

  getCatalogs = (query: AthenaQuery) =>
    this.postResource<string[]>('catalogs', {
      region: this.templateSrv.replace(query.connectionArgs.region),
    });

  getDatabases = (query: AthenaQuery) =>
    this.postResource<string[]>('databases', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
    });

  getTables = (query: AthenaQuery) =>
    this.postResource<string[]>('tables', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
      database: this.templateSrv.replace(query.connectionArgs.database),
    });

  getColumns = (query: AthenaQuery) =>
    this.postResource<string[]>('columns', {
      region: this.templateSrv.replace(query.connectionArgs.region),
      catalog: this.templateSrv.replace(query.connectionArgs.catalog),
      database: this.templateSrv.replace(query.connectionArgs.database),
      table: this.templateSrv.replace(query.table),
    });

  getWorkgroupEngineVersion = () => this.postResource<string>('workgroupEngineVersion', { workgroup: this.workgroup });

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

    const queries = options.targets.filter((item) => item.hide !== true && item.rawSQL);

    options.targets = this.buildQuery(options, queries);

    return super.query(options);
  }
}
