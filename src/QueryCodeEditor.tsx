import { defaults } from 'lodash';

import React from 'react';
import { CodeEditor, CodeEditorSuggestionItem } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { getSuggestions } from 'Suggestions';
import { AthenaQuery, defaultQuery } from './types';

type Props = {
  query: AthenaQuery;
  onChange: (value: AthenaQuery) => void;
  onRunQuery: () => void;
};

// getSuggestions result gets cached so we need to reference a var outside the component
// related issue: https://github.com/grafana/grafana/issues/39264
let suggestions: CodeEditorSuggestionItem[] = [];

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
  suggestions = getSuggestions({ query: props.query, templateSrv: getTemplateSrv() });

  return (
    <CodeEditor
      height={'240px'}
      language={'sql'}
      value={rawSQL}
      onBlur={onRawSqlChange}
      showMiniMap={false}
      showLineNumbers={true}
      getSuggestions={() => suggestions}
    />
  );
}
