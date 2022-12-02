import { Observable } from 'rxjs';
import { CustomVariableSupport, DataQueryRequest, DataQueryResponse } from '@grafana/data';
import { VariableQueryCodeEditor } from './VariableQueryEditor';
import { assign } from 'lodash';
import { DataSource } from './datasource';
import { AthenaQuery, defaultQuery } from './types';

export class AthenaVariableSupport extends CustomVariableSupport<DataSource, AthenaQuery, AthenaQuery> {
  constructor(private readonly datasource: DataSource) {
    super();
    this.datasource = datasource;
    this.query = this.query.bind(this);
  }

  editor = VariableQueryCodeEditor;

  query(request: DataQueryRequest<AthenaQuery>): Observable<DataQueryResponse> {
    // fill query params with default data
    assign(request.targets, [{ ...defaultQuery, ...request.targets[0], refId: 'A' }]);
    return this.datasource.query(request);
  }
}
