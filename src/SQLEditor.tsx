import { SQLEditor as SQLCodeEditor } from '@grafana/experimental';
import { DataSource } from 'datasource';
import { getAthenaCompletionProvider } from 'language/completionItemProvider';
import { TABLE_MACRO } from 'language/macros';
import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { AthenaQuery } from 'types';

interface RawEditorProps {
  query: AthenaQuery;
  onChange: (q: AthenaQuery) => void;
  datasource: DataSource;
}

export default function SQLEditor({ query, datasource, onChange }: RawEditorProps) {
  const queryRef = useRef<AthenaQuery>(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const getTables = useCallback(async () => {
    const tables: string[] = await datasource.getTables(queryRef.current).catch(() => []);
    return tables.map((table) => ({ name: table, completion: table }));
  }, [queryRef.current]);

  const getColumns = useCallback(
    async (tableName?: string) => {
      const columns: string[] = await datasource
        .getColumns({
          ...queryRef.current,
          table: tableName ? tableName.replace(TABLE_MACRO, queryRef.current.table ?? '') : queryRef.current.table,
        })
        .catch(() => []);
      return columns.map((column) => ({ name: column, completion: column }));
    },
    [queryRef.current]
  );

  const getTablesRef = useRef(getTables);
  const getColumnsRef = useRef(getColumns);
  const completionProvider = useMemo(
    () => getAthenaCompletionProvider({ getTables: getTablesRef, getColumns: getColumnsRef }),
    []
  );

  return (
    <SQLCodeEditor
      query={query.rawSQL}
      onChange={(rawSQL) => onChange({ ...queryRef.current, rawSQL })}
      language={{
        id: 'sql',
        completionProvider,
      }}
    ></SQLCodeEditor>
  );
}
