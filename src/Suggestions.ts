import { CodeEditorSuggestionItem, CodeEditorSuggestionItemKind } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { AthenaQuery } from 'types';
import { getSuggestions as sdkGetSuggestions } from '@grafana/aws-sdk';

export function getSuggestions(query: AthenaQuery) {
  const sugs: CodeEditorSuggestionItem[] = [
    {
      label: '$__dateFilter',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__parseTime',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__timeFilter',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__timeFrom',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__timeTo',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__timeGroup',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__unixEpochFilter',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__unixEpochGroup',
      kind: CodeEditorSuggestionItemKind.Method,
      detail: '(Macro)',
    },
    {
      label: '$__table',
      kind: CodeEditorSuggestionItemKind.Text,
      detail: `(Macro) ${query.table}`,
    },
    {
      label: '$__column',
      kind: CodeEditorSuggestionItemKind.Text,
      detail: `(Macro) ${query.column}`,
    },
  ];

  return sdkGetSuggestions(getTemplateSrv, sugs);
}
