import { Observable } from 'rxjs';
import { CustomVariableSupport, DataQueryRequest, DataQueryResponse } from '@grafana/data';
import { VariableQueryCodeEditor } from './VariableQueryEditor';
import { DataSource } from './datasource';
import { AthenaQuery } from './types';

export class AthenaVariableSupport extends CustomVariableSupport<DataSource, AthenaQuery, AthenaQuery> {
  constructor(private readonly datasource: DataSource) {
    super();
    this.datasource = datasource;
    this.query = this.query.bind(this);
  }

  editor = VariableQueryCodeEditor;

  query(request: DataQueryRequest<AthenaQuery>): Observable<DataQueryResponse> {
    return this.datasource.query(request);
  }
}
