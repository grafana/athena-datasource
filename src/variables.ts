import { DataSourceVariableSupport } from '@grafana/data';

import { DataSource } from './datasource';
import { AthenaQuery } from './types';

// allows us to use the same query editor for query-based template variables
export class AthenaVariableSupport extends DataSourceVariableSupport<DataSource, AthenaQuery> {}
