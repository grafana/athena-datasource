import React from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, SelectableFormatOptions } from './types';
import { InlineSegmentGroup } from '@grafana/ui';
import { config } from '@grafana/runtime';
import { FormatSelect, ResourceSelector } from '@grafana/aws-sdk';
import { RunQueryButtons } from '@grafana/async-query-data';
import { selectors } from 'tests/selectors';
import { appendTemplateVariables } from 'utils';
import SQLEditor from 'SQLEditor';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions> & {
  hideOptions?: boolean;
  hideRunQueryButtons?: boolean;
};

type QueryProperties = 'regions' | 'catalogs' | 'databases' | 'tables' | 'columns';

function isQueryValid(query: AthenaQuery) {
  return !!query.rawSQL;
}

export function QueryEditor(props: Props) {
  const { datasource, query, hideOptions, hideRunQueryButtons, data, onRunQuery, onChange } = props;

  const templateVariables = datasource.getVariables();

  const fetchRegions = () =>
    datasource.getRegions().then((regions) => appendTemplateVariables(templateVariables, regions));
  const fetchCatalogs = () =>
    datasource.getCatalogs(query).then((catalogs) => appendTemplateVariables(templateVariables, catalogs));
  const fetchDatabases = () =>
    datasource.getDatabases(query).then((databases) => appendTemplateVariables(templateVariables, databases));
  const fetchTables = () =>
    datasource.getTables(query).then((tables) => appendTemplateVariables(templateVariables, tables));
  const fetchColumns = () =>
    datasource.getColumns(query).then((columns) => appendTemplateVariables(templateVariables, columns));

  const onChangeResource = (prop: QueryProperties) => (e: SelectableValue<string> | null) => {
    const newQuery = { ...query };
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
    onChange(newQuery);
  };

  return (
    <>
      <InlineSegmentGroup>
        <div className="gf-form-group">
          <ResourceSelector
            onChange={onChangeResource('regions')}
            fetch={fetchRegions}
            value={query.connectionArgs.region ?? null}
            default={datasource.defaultRegion}
            label={selectors.components.ConfigEditor.region.input}
            data-testid={selectors.components.ConfigEditor.region.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChangeResource('catalogs')}
            fetch={fetchCatalogs}
            value={query.connectionArgs.catalog ?? null}
            default={datasource.defaultCatalog}
            dependencies={[query.connectionArgs.region]}
            label={selectors.components.ConfigEditor.catalog.input}
            data-testid={selectors.components.ConfigEditor.catalog.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChangeResource('databases')}
            fetch={fetchDatabases}
            value={query.connectionArgs.database ?? null}
            default={datasource.defaultDatabase}
            dependencies={[query.connectionArgs.catalog]}
            label={selectors.components.ConfigEditor.database.input}
            data-testid={selectors.components.ConfigEditor.database.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChangeResource('tables')}
            fetch={fetchTables}
            value={query.table || null}
            dependencies={[query.connectionArgs.database]}
            tooltip="Use the selected table with the $__table macro"
            label={selectors.components.ConfigEditor.table.input}
            data-testid={selectors.components.ConfigEditor.table.wrapper}
            labelWidth={11}
            className="width-12"
          />
          <ResourceSelector
            onChange={onChangeResource('columns')}
            fetch={fetchColumns}
            value={query.column || null}
            dependencies={[query.table]}
            tooltip="Use the selected column with the $__column macro"
            label={selectors.components.ConfigEditor.column.input}
            data-testid={selectors.components.ConfigEditor.column.wrapper}
            labelWidth={11}
            className="width-12"
          />
          {!hideOptions && (
            <>
              <h6>Frames</h6>
              <FormatSelect query={query} options={SelectableFormatOptions} onChange={props.onChange} />
            </>
          )}
        </div>

        <div style={{ minWidth: '400px', marginLeft: '10px', flex: 1 }}>
          <SQLEditor query={query} onChange={props.onChange} datasource={datasource} />
          {!hideRunQueryButtons && props?.app !== 'explore' && (
            <div style={{ marginTop: 8 }}>
              <RunQueryButtons
                onRunQuery={onRunQuery}
                onCancelQuery={config.featureToggles.athenaAsyncQueryDataSupport ? datasource.cancel : undefined}
                state={data?.state}
                query={query}
                isQueryValid={isQueryValid}
              />
            </div>
          )}
        </div>
      </InlineSegmentGroup>
    </>
  );
}
