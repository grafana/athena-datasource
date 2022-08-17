import {
  ColumnDefinition,
  getStandardSQLCompletionProvider,
  LanguageCompletionProvider,
  TableDefinition,
  TableIdentifier,
} from '@grafana/experimental';
import { MACROS } from './macros';

interface CompletionProviderGetterArgs {
  getTables: React.MutableRefObject<(d?: string) => Promise<TableDefinition[]>>;
  getColumns: React.MutableRefObject<(table: string) => Promise<ColumnDefinition[]>>;
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
          return await getTables.current();
        },
      },
      columns: {
        resolve: async (t: TableIdentifier) => getColumns.current(t.table!),
      },
      supportedMacros: () => MACROS,
    };
  };
