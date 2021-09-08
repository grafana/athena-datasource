import { defaults } from 'lodash';

import React from 'react';
import { AthenaQuery, defaultQuery } from './types';
import { CodeEditor } from '@grafana/ui';

type Props = {
  query: AthenaQuery;
  onChange: (value: AthenaQuery) => void;
  onRunQuery: () => void;
};

export function QueryCodeEditor(props: Props) {
  const { rawSQL } = defaults(props.query, defaultQuery);
  const onRawSqlChange = (rawSQL: string) => {
    const query = {
      ...props.query,
      rawSQL,
    };
    props.onChange(query);
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
