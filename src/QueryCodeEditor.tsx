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

  const getSuggestions = buildGetSuggestions({ query: props.query, templateSrv: getTemplateSrv() });

  return (
    <CodeEditor
      height={'240px'}
      language={'sql'}
      value={rawSQL}
      onBlur={(rawSQL) => {
        console.log('onBlur has been called, props.query.table is defined', props.query.table);
        onRawSqlChange(rawSQL);
      }}
      onSave={(rawSQL) => {
        console.log('onSave has been called, props.query.table is sometimes undefined', props.query.table);
        onRawSqlChange(rawSQL);
      }}
      showMiniMap={false}
      showLineNumbers={true}
      getSuggestions={getSuggestions}
    />
  );
}
