import { SelectableValue } from '@grafana/data';
import { InlineFormLabel, SegmentAsync } from '@grafana/ui';
import React, { useState, useCallback, useRef } from 'react';
import { AthenaQuery } from 'types';
import { DataSource } from './datasource';

export type Resource = 'table' | 'column';

interface ResourceMacrosProps {
  query: AthenaQuery;
  datasource: DataSource;
  onChange: (query: AthenaQuery) => void;
  onRunQuery: () => void;
  dependencies: string;
}

enum optionStatus {
  loading,
  fetched
}

function useGetMacroDropdownOptions(fetchFn: () => Promise<string[]>, dependencies: string) {
  const initialOptions : { label: string; value: string; }[] = [];
  const [macroOptions, setMacroOptions] = useState(initialOptions);
  const [status, setStatus] = useState(optionStatus.loading);
  const oldDependencies = useRef(dependencies);

  const getOptions = async () => {
    // if we've already fetched the selectable options return them
    if (status === optionStatus.fetched && oldDependencies.current === dependencies) {
      return macroOptions
    }

    // prevents flash of old data
    setMacroOptions(initialOptions);
    setStatus(optionStatus.loading);

    // otherwise fetch them
    const fetchedMacroOptions = await fetchFn()
    
    // format into a selectable object
    const options = fetchedMacroOptions.map((name: string) => {
      return { label: name, value: name };
    });

    // add a remove selection option
    options.push({
      label: '-- remove --',
      value: '',
    });
    
    // cache them
    setMacroOptions(options);
    setStatus(optionStatus.fetched);

    // and return 
    return options;
  };

  return getOptions
}

export const ResourceMacros = ({ query, datasource, onChange, onRunQuery, dependencies }: ResourceMacrosProps) => {
  // Tables
  const fetchTables = useCallback(() => datasource.postResource('tablesWithConnectionDetails', { ...query.connectionArgs }), [datasource, query])
  const getTables = useGetMacroDropdownOptions(fetchTables, dependencies);
  const selectTable = useCallback((item: SelectableValue<string>) => {
    const selectedTable = item.value;
    onChange({
      ...query,
      table: selectedTable,
      column: undefined
    })
    onRunQuery()
  }, [onChange, onRunQuery, query]);

  // Columns
  const fetchColumns = useCallback(() => datasource.postResource('columnsWithConnectionDetails', { ...query.connectionArgs, table: query.table }), [datasource, query])
  const getColumns = useGetMacroDropdownOptions(fetchColumns, dependencies);
  const selectColumn = useCallback((item: SelectableValue<string>) => {
    const selectedColumn = item.value;
    onChange({
      ...query,
      column: selectedColumn,
    })
    onRunQuery()
  }, [onChange, onRunQuery, query]);

  const createPlaceholderText = (type: string, value: string) =>`$__${type} = ${value}`;

  return (
    <div className={'gf-form-inline'}>
      <InlineFormLabel width={8} className="query-keyword">
        Macros
      </InlineFormLabel>
      <SegmentAsync
        value={createPlaceholderText("table", query.table || "")}
        loadOptions={getTables}
        placeholder={createPlaceholderText("table", query.table || "")}
        onChange={selectTable}
        allowCustomValue
      />
      <SegmentAsync
        value={createPlaceholderText("column", query.column || "")}
        loadOptions={getColumns}
        placeholder={createPlaceholderText("column", query.column || "")}
        onChange={selectColumn}
        allowCustomValue
      />
      <div className="gf-form gf-form--grow">
        <div className="gf-form-label gf-form-label--grow" />
      </div>
    </div>
  );
};

