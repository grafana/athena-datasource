import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { DataSource } from './datasource';
import { QueryEditorForm } from './QueryEditorForm';
import { QueryEditorHeader } from '@grafana/aws-sdk';

export function QueryEditor(props: QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>) {
  return (
    <>
      {props?.app !== 'explore' && (
        <QueryEditorHeader<DataSource, AthenaQuery, AthenaDataSourceOptions>
          {...props}
          enableRunButton={!!props.query.rawSQL}
          showAsyncQueryButtons
          cancel={props.datasource.cancel}
        />
      )}
      <QueryEditorForm {...props} />
    </>
  );
}
