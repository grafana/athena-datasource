import {
  ColumnDefinition,
  getStandardSQLCompletionProvider,
  LanguageCompletionProvider,
  TableDefinition,
  TableIdentifier,
} from '@grafana/plugin-ui';
import { MACROS } from './macros';

interface CompletionProviderGetterArgs {
  getTables: (d: TableIdentifier | null) => Promise<TableDefinition[]>;
  getColumns: (table: string) => Promise<ColumnDefinition[]>;
}

export const getAthenaCompletionProvider: (args: CompletionProviderGetterArgs) => LanguageCompletionProvider =
  ({ getTables, getColumns }) =>
  (monaco, language) => {
    return {
      // get standard SQL completion provider which will resolve functions and macros
      ...(language && getStandardSQLCompletionProvider(monaco, language)),
      triggerCharacters: ['.', ' ', '$', ',', '(', "'"],
      tables: {
        resolve: getTables,
      },
      columns: {
        resolve: (t?: TableIdentifier) => getColumns(t?.table ?? ''),
      },
      supportedMacros: () => MACROS,
    };
  };
