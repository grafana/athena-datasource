import React from 'react';
import { QueryCodeEditor } from '@grafana/aws-sdk';
import { getSuggestions } from 'Suggestions';
import { getTemplateSrv } from '@grafana/runtime';
import { AthenaQuery, AthenaDataSourceOptions } from './types';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from 'datasource';

export function VariableQueryCodeEditor(props: QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>) {
  return <QueryCodeEditor {...props} language="sql" getSuggestions={getSuggestions} getTemplateSrv={getTemplateSrv} />;
}
