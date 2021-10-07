import { CodeEditorSuggestionItem, CodeEditorSuggestionItemKind } from '@grafana/ui';
import { TemplateSrv } from '@grafana/runtime';
import { AthenaQuery } from 'types';

export class Suggestions {
  public query;
  private templateSrv;

  constructor({ templateSrv, query }: { templateSrv: TemplateSrv; query: AthenaQuery }) {
    this.query = query;
    this.templateSrv = templateSrv;
  }

  public list() {
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
        label: '$__table',
        kind: CodeEditorSuggestionItemKind.Text,
        detail: `(Macro) ${this.query.table}`,
      },
      {
        label: '$__column',
        kind: CodeEditorSuggestionItemKind.Text,
        detail: `(Macro) ${this.query.column}`,
      },
    ];

    this.templateSrv.getVariables().forEach((variable) => {
      const label = '$' + variable.name;
      let val = this.templateSrv.replace(label);
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
  }
}
