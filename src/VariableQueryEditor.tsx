import React from 'react';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { CoreApp, QueryEditorProps } from '@grafana/data';
import { DataSource } from 'datasource';
import { QueryEditor } from 'QueryEditor';

export function VariableQueryCodeEditor(props: QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>) {
  const variableEditorQuery: AthenaQuery = { ...props.datasource.getDefaultQuery(CoreApp.Unknown), refId: 'A' };
  return <QueryEditor {...props} query={variableEditorQuery} hideOptions hideRunQueryButtons />;
}
