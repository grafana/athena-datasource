import React from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery, SelectableFormatOptions } from './types';
import { InlineSegmentGroup } from '@grafana/ui';
import { FormatSelect, ResourceSelector, QueryCodeEditor } from '@grafana/aws-sdk';
import { selectors } from 'tests/selectors';
import { getSuggestions } from 'Suggestions';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

type QueryProperties = 'regions' | 'catalogs' | 'databases' | 'tables' | 'columns';

export function QueryEditor(props: Props) {
  const queryWithDefaults = {
    ...defaultQuery,
    ...props.query,
    connectionArgs: {
      ...defaultQuery.connectionArgs,
      ...props.query.connectionArgs,
    },
  };

  const fetchRegions = () => props.datasource.getResource('regions');
  const fetchCatalogs = () =>
    props.datasource.postResource('catalogs', {
      region: queryWithDefaults.connectionArgs.region,
    });
  const fetchDatabases = () =>
    props.datasource.postResource('databases', {
      region: queryWithDefaults.connectionArgs.region,
      catalog: queryWithDefaults.connectionArgs.catalog,
    });
  const fetchTables = () =>
    props.datasource.postResource('tables', {
      region: queryWithDefaults.connectionArgs.region,
      catalog: queryWithDefaults.connectionArgs.catalog,
      database: queryWithDefaults.connectionArgs.database,
    });

  const fetchColumns = () =>
    props.datasource.postResource('columns', {
      ...queryWithDefaults.connectionArgs,
      table: queryWithDefaults.table,
    });

  const onChange = (prop: QueryProperties) => (e: SelectableValue<string> | null) => {
    const newQuery = { ...props.query };
    const value = e?.value;
    switch (prop) {
      case 'regions':
        newQuery.connectionArgs = { ...newQuery.connectionArgs, region: value };
        break;
      case 'catalogs':
        newQuery.connectionArgs = { ...newQuery.connectionArgs, catalog: value };
        break;
      case 'databases':
        newQuery.connectionArgs = { ...newQuery.connectionArgs, database: value };
        break;
      case 'tables':
        newQuery.table = value;
        break;
      case 'columns':
        newQuery.column = value;
        break;
    }
    props.onChange(newQuery);
    if (props.onRunQuery) {
      props.onRunQuery();
    }
  };

  return (
    <>
      <InlineSegmentGroup>
        <div className="gf-form-group">
          <ResourceSelector
            onChange={onChange('regions')}
            fetch={fetchRegions}
            value={queryWithDefaults.connectionArgs.region ?? null}
            default={props.datasource.defaultRegion}
            label={selectors.components.ConfigEditor.region.input}
            data-testid={selectors.components.ConfigEditor.region.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChange('catalogs')}
            fetch={fetchCatalogs}
            value={queryWithDefaults.connectionArgs.catalog ?? null}
            default={props.datasource.defaultCatalog}
            dependencies={[queryWithDefaults.connectionArgs.region]}
            label={selectors.components.ConfigEditor.catalog.input}
            data-testid={selectors.components.ConfigEditor.catalog.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChange('databases')}
            fetch={fetchDatabases}
            value={queryWithDefaults.connectionArgs.database ?? null}
            default={props.datasource.defaultDatabase}
            dependencies={[queryWithDefaults.connectionArgs.catalog]}
            label={selectors.components.ConfigEditor.database.input}
            data-testid={selectors.components.ConfigEditor.database.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChange('tables')}
            fetch={fetchTables}
            value={props.query.table || null}
            dependencies={[queryWithDefaults.connectionArgs.database]}
            tooltip="Use the selected table with the $__table macro"
            label={selectors.components.ConfigEditor.table.input}
            data-testid={selectors.components.ConfigEditor.table.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChange('columns')}
            fetch={fetchColumns}
            value={props.query.column || null}
            dependencies={[queryWithDefaults.table]}
            tooltip="Use the selected column with the $__column macro"
            label={selectors.components.ConfigEditor.column.input}
            data-testid={selectors.components.ConfigEditor.column.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <h6>Frames</h6>
          <FormatSelect
            query={props.query}
            options={SelectableFormatOptions}
            onChange={props.onChange}
            onRunQuery={props.onRunQuery}
          />
        </div>
        <div style={{ minWidth: '400px', marginLeft: '10px', flex: 1 }}>
          <QueryCodeEditor
            language="sql"
            query={queryWithDefaults}
            onChange={props.onChange}
            onRunQuery={props.onRunQuery}
            getSuggestions={getSuggestions}
          />
        </div>
      </InlineSegmentGroup>
    </>
  );
}
