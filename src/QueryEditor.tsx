import { defaults } from 'lodash';

import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery } from './types';
import { CodeEditor } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const { rawSQL } = defaults(props.query, defaultQuery);

  const onRawSqlChange = (rawSQL: string) => {
    props.onChange({
      ...props.query,
      rawSQL,
    });
    props.onRunQuery();
  };
  return (
    <CodeEditor
      height={'250px'}
      language={'sql'}
      value={rawSQL}
      onBlur={onRawSqlChange}
      onSave={onRawSqlChange}
      showMiniMap={false}
      showLineNumbers={true}
    />
  );
}
