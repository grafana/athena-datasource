import { defaults } from 'lodash';

import React from 'react';
import { CodeEditor } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { buildGetSuggestions } from 'Suggestions';
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

  const getSuggestions = buildGetSuggestions({ query: props.query, templateSrv: getTemplateSrv() })

  return (
    <CodeEditor
      height={'250px'}
      language={'sql'}
      value={rawSQL}
      onBlur={onRawSqlChange}
      // removed onSave due to bug: https://github.com/grafana/grafana/issues/39264
      showMiniMap={false}
      showLineNumbers={true}
      getSuggestions={getSuggestions}
    />
  );
}
