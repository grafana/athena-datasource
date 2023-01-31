import React from 'react';
import { AthenaQuery, AthenaDataSourceOptions } from './types';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from 'datasource';
import { QueryEditor } from 'QueryEditor';

export function AnnotationQueryEditor(props: QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>) {
  return <QueryEditor {...props} hideOptions hideRunQueryButtons />;
}
