import { defaults } from 'lodash';

import React, { useState, useEffect } from 'react';
import { CodeEditor } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { Suggestions } from 'Suggestions';
import { AthenaQuery, defaultQuery } from './types';

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
  const [suggestions] = useState(
    new Suggestions({ table: props.query.table, column: props.query.column, templateSrv: getTemplateSrv() })
  );
  useEffect(() => {
    if (suggestions.table !== props.query.table) {
      suggestions.table = props.query.table;
    }
    if (suggestions.column !== props.query.column) {
      suggestions.column = props.query.column;
    }
  }, [suggestions, props.query.table, props.query.column]);

  return (
    <CodeEditor
      height={'240px'}
      language={'sql'}
      value={rawSQL}
      onBlur={onRawSqlChange}
      showMiniMap={false}
      showLineNumbers={true}
      getSuggestions={() => suggestions.list()}
    />
  );
}
