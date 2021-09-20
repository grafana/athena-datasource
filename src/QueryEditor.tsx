import React from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import {
  AthenaDataSourceOptions,
  AthenaQuery,
  defaultKey,
  defaultQuery,
  FormatOptions,
  SelectableFormatOptions,
} from './types';
import { InlineField, InlineSegmentGroup, Select } from '@grafana/ui';
import { QueryCodeEditor } from 'QueryCodeEditor';
import { AthenaSelector, isMissingDependency } from 'AthenaSelector';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const queryWithDefaults = {
    ...defaultQuery,
    ...props.query,
    connectionArgs: {
      ...defaultQuery.connectionArgs,
      ...props.query.connectionArgs,
    },
  };

  // region
  const region =
    queryWithDefaults.connectionArgs.region === defaultKey
      ? props.datasource.defaultRegion
      : queryWithDefaults.connectionArgs.region;
  const fetchRegions = async () => await props.datasource.getResource('regions');
  const onRegionChange = (item: SelectableValue<string>) => {
    const selectedRegion = item.value;
    props.onChange({
      ...queryWithDefaults,
      table: undefined,
      column: undefined,
      connectionArgs: {
        region: selectedRegion || '',
        catalog: '',
        database: '',
      },
    });
  };

  const createFetchWithDependencies = (resource: string, dependencies: Record<string, string | undefined>) => {
    return async () => {
      if (isMissingDependency(dependencies)) {
        return [];
      }
      return props.datasource.postResource(resource, dependencies);
    };
  };

  // catalog
  const catalog =
    queryWithDefaults.connectionArgs.catalog === defaultKey
      ? props.datasource.defaultCatalog
      : queryWithDefaults.connectionArgs.catalog;
  const catalogDependencies = { region };
  const fetchCatalogs = async () => {
    if (isMissingDependency(catalogDependencies)) {
      return [];
    }

    return props.datasource.postResource('catalogs', catalogDependencies);
  };
  const onCatalogChange = (item: SelectableValue<string>) => {
    const selectedCatalog = item.value;
    props.onChange({
      ...queryWithDefaults,
      table: undefined,
      column: undefined,
      connectionArgs: {
        ...queryWithDefaults.connectionArgs,
        catalog: selectedCatalog || '',
        database: '',
      },
    });
  };

  // database
  const database =
    queryWithDefaults.connectionArgs.database === defaultKey
      ? props.datasource.defaultDatabase
      : queryWithDefaults.connectionArgs.database;
  const databaseDependencies = { region, catalog };
  const fetchDatabases = createFetchWithDependencies('databases', databaseDependencies);
  const onDatabaseChange = (item: SelectableValue<string>) => {
    const selectedDatabase = item.value;
    props.onChange({
      ...queryWithDefaults,
      table: undefined,
      column: undefined,
      connectionArgs: {
        ...queryWithDefaults.connectionArgs,
        database: selectedDatabase || '',
      },
    });
    // now that connection args are complete, run request
    props.onRunQuery();
  };

  // table
  const tableDependencies = { ...queryWithDefaults.connectionArgs };
  const fetchTables = createFetchWithDependencies('tablesWithConnectionDetails', tableDependencies);
  const selectTable = (item: SelectableValue<string>) => {
    const selectedTable = item.value;
    props.onChange({
      ...queryWithDefaults,
      table: selectedTable,
      column: undefined,
    });
    props.onRunQuery();
  };

  // column
  const columnDependencies = {
    ...queryWithDefaults.connectionArgs,
    table: queryWithDefaults.table,
  };
  const fetchColumns = createFetchWithDependencies('columnsWithConnectionDetails', columnDependencies);
  const selectColumn = (item: SelectableValue<string>) => {
    const selectedColumn = item.value;
    props.onChange({
      ...queryWithDefaults,
      column: selectedColumn,
    });
    props.onRunQuery();
  };

  // format: table vs timeseries
  const onChangeFormat = (e: SelectableValue<FormatOptions>) => {
    props.onChange({
      ...queryWithDefaults,
      format: e.value || FormatOptions.TimeSeries,
    });
    props.onRunQuery();
  };

  return (
    <>
      <h6>Connection Details</h6>
      <InlineSegmentGroup>
        <AthenaSelector
          label="Region"
          labelWidth={10}
          value={region || undefined}
          fetchFn={fetchRegions}
          selectOption={onRegionChange}
          dependencies={{}}
        />
        <AthenaSelector
          label="Catalog (datasource)"
          labelWidth={10}
          value={catalog || undefined}
          fetchFn={fetchCatalogs}
          selectOption={onCatalogChange}
          dependencies={catalogDependencies}
        />
        <AthenaSelector
          label="Database"
          labelWidth={10}
          value={database || undefined}
          fetchFn={fetchDatabases}
          selectOption={onDatabaseChange}
          dependencies={databaseDependencies}
        />
      </InlineSegmentGroup>
      <h6>Macros</h6>
      <InlineSegmentGroup>
        <AthenaSelector
          label={'$__table ='}
          labelWidth={10}
          fetchFn={fetchTables}
          value={queryWithDefaults.table}
          selectOption={selectTable}
          dependencies={tableDependencies}
        />
        <AthenaSelector
          label={'$__column ='}
          labelWidth={12}
          fetchFn={fetchColumns}
          value={queryWithDefaults.column}
          selectOption={selectColumn}
          dependencies={columnDependencies}
        />
      </InlineSegmentGroup>
      <QueryCodeEditor query={queryWithDefaults} onChange={props.onChange} onRunQuery={props.onRunQuery} />
      <InlineSegmentGroup>
        <InlineField label="Format as">
          <Select options={SelectableFormatOptions} value={queryWithDefaults.format} onChange={onChangeFormat} />
        </InlineField>
      </InlineSegmentGroup>
    </>
  );
}
