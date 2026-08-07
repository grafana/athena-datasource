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

  applyTemplateVariables = (query: AthenaQuery, scopedVars: ScopedVars): AthenaQuery => ({
    ...applySQLTemplateVariables(query, scopedVars, () => this.templateSrv),
    connectionArgs: {
      ...query.connectionArgs,
      region: this.templateSrv.replace(query.connectionArgs?.region, scopedVars),
      catalog: this.templateSrv.replace(query.connectionArgs?.catalog, scopedVars),
      database: this.templateSrv.replace(query.connectionArgs?.database, scopedVars),
    },
    table: query.table ? this.templateSrv.replace(query.table, scopedVars) : undefined,
    column: query.column ? this.templateSrv.replace(query.column, scopedVars) : undefined,
  });

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

  query(options: DataQueryRequest<AthenaQuery>): Observable<DataQueryResponse> {
    options = cloneDeep(options);

    options.targets = options.targets.filter((item) => item.hide !== true && item.rawSQL);

    return super.query(options);
  }
}
