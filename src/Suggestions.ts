import { CodeEditorSuggestionItem, CodeEditorSuggestionItemKind } from '@grafana/ui';
import { TemplateSrv } from '@grafana/runtime';
import { AthenaQuery } from 'types';

export const buildGetSuggestions = ({ templateSrv, query }: { templateSrv: TemplateSrv; query: AthenaQuery }) => {
  return (): CodeEditorSuggestionItem[] => {
    const sugs: CodeEditorSuggestionItem[] = [
      {
        label: '$__dateFilter',
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

    templateSrv.getVariables().forEach((variable) => {
      const label = '$' + variable.name;
      let val = templateSrv.replace(label);
      if (val === label) {
        val = '';
      }
      sugs.push({
        label,
        kind: CodeEditorSuggestionItemKind.Text,
        detail: `(Template Variable) ${val}`,
      });
    });

    return sugs;
  };
};
