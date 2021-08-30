import { Observable } from 'rxjs';
import { DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { AthenaVariableSupport } from './variables';

export class DataSource extends DataSourceWithBackend<AthenaQuery, AthenaDataSourceOptions> {
  defaultRegion = '';
  defaultCatalog = '';

  constructor(instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>) {
    super(instanceSettings);
    this.defaultRegion = instanceSettings.jsonData.defaultRegion || '';
    this.defaultCatalog = instanceSettings.jsonData.catalog || '';
    this.variables = new AthenaVariableSupport();
  }

  query(request: DataQueryRequest<AthenaQuery>): Observable<DataQueryResponse> {
    // What is this about? Due to a bug in the templating query system, data source variables doesn't get assigned ref id.
    // This leads to bad things to therefore we need to assign a dummy value in case it's undefined.
    // The implementation of this method can be removed completely once we upgrade to a version of grafana/data that has this https://github.com/grafana/grafana/pull/35923
    request.targets = request.targets.map((q) => ({ ...q, refId: q.refId ?? 'variable-query' }));
    return super.query(request);
  }

  applyTemplateVariables(query: AthenaQuery, scopedVars: ScopedVars): AthenaQuery {
    const templateSrv = getTemplateSrv();
    return {
      ...query,
      // note: athena does not accept queries with numbers and variables in quotes for example:
      // select location from "cloudfront_logs" limit "2" would error on both items in quotes
      // as a result we send along the raw value directly, which means if you want to send along a string to athena
      // you must save the template variable with quotation marks and it should send the quotation marks along with the query
      rawSQL: templateSrv.replace(query.rawSQL, scopedVars, 'raw'),
    };
  }
}
