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
  const [suggestions] = useState(new Suggestions({ query: props.query, templateSrv: getTemplateSrv() }));
  useEffect(() => {
    suggestions.query = props.query;
  }, [props.query]);

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
