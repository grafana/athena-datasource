import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery, SelectableFormatOptions } from './types';
import { InlineSegmentGroup } from '@grafana/ui';
import { FormatSelect, QuerySelect, QueryCodeEditor } from '@grafana/aws-sdk';
import { selectors } from 'tests/selectors';
import { getTemplateSrv } from '@grafana/runtime';
import { getSuggestions } from 'Suggestions';

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

  return (
    <>
      <InlineSegmentGroup>
        <div className="gf-form-group">
          <QuerySelect
            query={props.query}
            default={props.datasource.defaultRegion}
            queryPropertyPath="connectionArgs.region"
            fetch={fetchRegions}
            onChange={props.onChange}
            label={selectors.components.ConfigEditor.region.input}
            data-testid={selectors.components.ConfigEditor.region.wrapper}
          />
          <QuerySelect
            query={props.query}
            default={props.datasource.defaultCatalog}
            queryPropertyPath="connectionArgs.catalog"
            fetch={fetchCatalogs}
            onChange={props.onChange}
            label={selectors.components.ConfigEditor.catalog.input}
            data-testid={selectors.components.ConfigEditor.catalog.wrapper}
            dependencies={[queryWithDefaults.connectionArgs.region]}
          />
          <QuerySelect
            query={props.query}
            default={props.datasource.defaultDatabase}
            queryPropertyPath="connectionArgs.database"
            fetch={fetchDatabases}
            onChange={props.onChange}
            label={selectors.components.ConfigEditor.database.input}
            data-testid={selectors.components.ConfigEditor.database.wrapper}
            dependencies={[queryWithDefaults.connectionArgs.catalog]}
          />
          <QuerySelect
            query={props.query}
            queryPropertyPath="table"
            fetch={fetchTables}
            onChange={props.onChange}
            label={selectors.components.ConfigEditor.table.input}
            data-testid={selectors.components.ConfigEditor.table.wrapper}
            tooltip="Use the selected table with the $__table macro"
            dependencies={[queryWithDefaults.connectionArgs.database]}
            onRunQuery={props.onRunQuery}
          />
          <QuerySelect
            query={props.query}
            queryPropertyPath="column"
            fetch={fetchColumns}
            onChange={props.onChange}
            label={selectors.components.ConfigEditor.column.input}
            data-testid={selectors.components.ConfigEditor.column.wrapper}
            tooltip="Use the selected column with the $__column macro"
            dependencies={[props.query.table || '']}
            onRunQuery={props.onRunQuery}
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
            query={queryWithDefaults}
            onChange={props.onChange}
            onRunQuery={props.onRunQuery}
            getSuggestions={getSuggestions}
            getTemplateSrv={getTemplateSrv}
          />
        </div>
      </InlineSegmentGroup>
    </>
  );
}
