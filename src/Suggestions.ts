import { CodeEditorSuggestionItem, CodeEditorSuggestionItemKind } from '@grafana/ui';
import { TemplateSrv } from '@grafana/runtime';

export class Suggestions {
  table;
  column;
  templateSrv;

  constructor({ templateSrv, table, column }: { templateSrv: TemplateSrv; table?: string; column?: string }) {
    this.table = table;
    this.column = column;
    this.templateSrv = templateSrv;
  }

  list() {
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
        detail: `(Macro) ${this.table}`,
      },
      {
        label: '$__column',
        kind: CodeEditorSuggestionItemKind.Text,
        detail: `(Macro) ${this.column}`,
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
