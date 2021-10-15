import { defaults } from 'lodash';

import React, { useRef, useEffect } from 'react';
import { CodeEditor, CodeEditorSuggestionItem } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { getSuggestions } from 'Suggestions';
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
  const suggestionsRef = useRef<CodeEditorSuggestionItem[]>([]);
  useEffect(() => {
    suggestionsRef.current = getSuggestions(getTemplateSrv(), props.query.table, props.query.column);
  }, [props.query.table, props.query.column]);

  return (
    <CodeEditor
      height={'240px'}
      language={'sql'}
      value={rawSQL}
      onBlur={onRawSqlChange}
      showMiniMap={false}
      showLineNumbers={true}
      getSuggestions={() => suggestionsRef.current}
    />
  );
}
