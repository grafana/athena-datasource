import {
  ColumnDefinition,
  getStandardSQLCompletionProvider,
  LanguageCompletionProvider,
  TableDefinition,
  TableIdentifier,
} from '@grafana/experimental';
import { MACROS } from './macros';

interface CompletionProviderGetterArgs {
  getTables: (d?: string) => Promise<TableDefinition[]>;
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
        resolve: async () => {
          return await getTables();
        },
      },
      columns: {
        resolve: async (t: TableIdentifier) => getColumns(t.table!),
      },
      supportedMacros: () => MACROS,
    };
  };
