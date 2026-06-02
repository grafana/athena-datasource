import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '@/datasource';
import { QueryEditorForm } from '@/QueryEditorForm';
import type { AthenaQuery, AthenaDataSourceOptions } from '@/types';

export function AnnotationQueryEditor(props: QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>) {
  return <QueryEditorForm {...props} hideOptions />;
}
