import React from 'react';
import { AthenaQuery, AthenaDataSourceOptions } from './types';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from 'datasource';
import { QueryEditorForm } from './QueryEditorForm';

export function AnnotationQueryEditor(props: QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>) {
  return <QueryEditorForm {...props} hideOptions />;
}
