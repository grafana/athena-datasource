import React, { useState } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery, FormatOptions, SelectableFormatOptions } from './types';
import { InlineField, InlineSegmentGroup, Select } from '@grafana/ui';
import { QueryCodeEditor } from 'QueryCodeEditor';
import { AthenaResourceSelector } from 'AthenaResourceSelector';

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

  // Region selector
  const [region, setRegion] = useState(queryWithDefaults.connectionArgs.region);
  const fetchRegions = async () => {
    const regions = await props.datasource.getResource('regions');
    return regions;
  };
  const onRegionChange = (region: string | null) => {
    setRegion(region || '');
    props.onChange({
      ...props.query,
      connectionArgs: {
        ...queryWithDefaults.connectionArgs,
        region: region || '',
      },
    });
  };

  // Catalog selector
  const [catalog, setCatalog] = useState<string | null>(queryWithDefaults.connectionArgs.catalog);
  const fetchCatalogs = async () => await props.datasource.postResource('catalogs', { region });
  const onCatalogChange = (catalog: string | null) => {
    setCatalog(catalog);
    props.onChange({
      ...props.query,
      connectionArgs: {
        ...queryWithDefaults.connectionArgs,
        catalog: catalog || '',
      },
    });
  };

  // Database selector
  const [database, setDatabase] = useState<string | null>(queryWithDefaults.connectionArgs.database);
  const fetchDatabases = async () => await props.datasource.postResource('databases', { region, catalog });
  const onDatabaseChange = (database: string | null) => {
    setDatabase(database);
    props.onChange({
      ...props.query,
      connectionArgs: {
        ...queryWithDefaults.connectionArgs,
        database: database || '',
      },
    });
    // now that connection args are complete, run request
    props.onRunQuery();
  };

  // Tables selector
  const [table, setTable] = useState<string | null>(queryWithDefaults.table || null);
  const fetchTables = async () =>
    await props.datasource.postResource('tablesWithConnectionDetails', { region, catalog, database });
  const onTableChange = (newTable: string | null) => {
    setTable(newTable);
    props.onChange({
      ...queryWithDefaults,
      table: newTable || undefined,
      column: undefined,
    });
    props.onRunQuery();
  };

  // column
  const [column, setColumn] = useState<string | null>(queryWithDefaults.column || null);
  const columnDependencies = {
    ...queryWithDefaults.connectionArgs,
    table: queryWithDefaults.table,
  };
  const fetchColumns = async () =>
    await props.datasource.postResource('columnsWithConnectionDetails', columnDependencies);
  const onColumnChange = (newColumn: string | null) => {
    setColumn(newColumn);
    props.onChange({
      ...queryWithDefaults,
      column: newColumn || undefined,
    });
    props.onRunQuery();
  };

  const onChangeFormat = (e: SelectableValue<FormatOptions>) => {
    props.onChange({
      ...props.query,
      format: e.value || FormatOptions.TimeSeries,
    });
    props.onRunQuery();
  };

  return (
    <>
      <InlineSegmentGroup>
        <div>
          <AthenaResourceSelector
            resource="region"
            value={region}
            fetch={fetchRegions}
            onChange={onRegionChange}
            default={props.datasource.defaultRegion}
          />
          <AthenaResourceSelector
            resource="catalog"
            value={catalog}
            fetch={fetchCatalogs}
            onChange={onCatalogChange}
            default={props.datasource.defaultCatalog}
            dependencies={[region]}
          />
          <AthenaResourceSelector
            resource="database"
            value={database}
            fetch={fetchDatabases}
            onChange={onDatabaseChange}
            default={props.datasource.defaultDatabase}
            dependencies={[region, catalog]}
          />
          <AthenaResourceSelector
            resource="table"
            value={table}
            fetch={fetchTables}
            onChange={onTableChange}
            dependencies={[region, catalog, database]}
            tooltip="Use the selected table the $__table macro"
          />
          <AthenaResourceSelector
            resource="column"
            value={column}
            fetch={fetchColumns}
            onChange={onColumnChange}
            dependencies={[region, catalog, database, table]}
            tooltip="Use the selected column the $__column macro"
          />
        </div>
        <div style={{ minWidth: '70%', marginLeft: '10px', flex: 1 }}>
          <QueryCodeEditor query={queryWithDefaults} onChange={props.onChange} onRunQuery={props.onRunQuery} />
        </div>
      </InlineSegmentGroup>
      <InlineSegmentGroup>
        <InlineField label="Format as">
          <Select options={SelectableFormatOptions} value={queryWithDefaults.format} onChange={onChangeFormat} />
        </InlineField>
      </InlineSegmentGroup>
    </>
  );
}
