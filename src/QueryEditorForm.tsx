import React, { useEffect, useState } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery, SelectableFormatOptions } from './types';
import { InlineSegmentGroup } from '@grafana/ui';
import { FormatSelect, ResourceSelector } from '@grafana/aws-sdk';
import { selectors } from 'tests/selectors';
import { appendTemplateVariables } from 'utils';
import SQLEditor from 'SQLEditor';
import { ResultReuse } from 'ResultReuse/ResultReuse';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions> & {
  hideOptions?: boolean;
};

type QueryProperties = 'regions' | 'catalogs' | 'databases' | 'tables' | 'columns';

export function QueryEditorForm(props: Props) {
  const [resultReuseSupported, setResultReuseSupported] = useState(false);
  useEffect(() => {
    const getIsResultReuseSupported = async () => {
      setResultReuseSupported(await props.datasource.isResultReuseSupported());
    };
    getIsResultReuseSupported();
  }, [props.datasource]);
  const queryWithDefaults = {
    ...defaultQuery,
    ...props.query,
    connectionArgs: {
      ...defaultQuery.connectionArgs,
      ...props.query.connectionArgs,
    },
  };

  const templateVariables = props.datasource.getVariables();

  const fetchRegions = () =>
    props.datasource.getRegions().then((regions) => appendTemplateVariables(templateVariables, regions));
  const fetchCatalogs = () =>
    props.datasource
      .getCatalogs(queryWithDefaults)
      .then((catalogs) => appendTemplateVariables(templateVariables, catalogs));
  const fetchDatabases = () =>
    props.datasource
      .getDatabases(queryWithDefaults)
      .then((databases) => appendTemplateVariables(templateVariables, databases));
  const fetchTables = () =>
    props.datasource.getTables(queryWithDefaults).then((tables) => appendTemplateVariables(templateVariables, tables));
  const fetchColumns = () =>
    props.datasource
      .getColumns(queryWithDefaults)
      .then((columns) => appendTemplateVariables(templateVariables, columns));

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
          <ResultReuse enabled={resultReuseSupported} query={props.query} onChange={props.onChange} />
          {!props.hideOptions && (
            <>
              <h6>Frames</h6>
              <FormatSelect query={props.query} options={SelectableFormatOptions} onChange={props.onChange} />
            </>
          )}
        </div>

        <div style={{ minWidth: '400px', marginLeft: '10px', flex: 1 }}>
          <SQLEditor query={queryWithDefaults} onChange={props.onChange} datasource={props.datasource} />
        </div>
      </InlineSegmentGroup>
    </>
  );
}
