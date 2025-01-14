import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import {
  AthenaDataSourceOptions,
  AthenaQuery,
  defaultQuery,
  QueryEditorFieldType,
  SelectableFormatOptions,
} from './types';
import { CollapsableSection, useStyles2 } from '@grafana/ui';
import { FormatSelect, ResourceSelector } from '@grafana/aws-sdk';
import { selectors } from 'tests/selectors';
import { appendTemplateVariables } from 'utils';
import SQLEditor from 'SQLEditor';
import { ResultReuse } from 'ResultReuse/ResultReuse';
import { EditorField, EditorFieldGroup, EditorRow, EditorRows } from '@grafana/plugin-ui';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions> & {
  hideOptions?: boolean;
};

export function QueryEditorForm(props: Props) {
  const [resultReuseSupported, setResultReuseSupported] = useState(false);
  const styles = useStyles2(getStyles);

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

  /*
    State used force the component to re-render when fetching
    editor field options so they show up in the select component
  */
  const [needsUpdate, setNeedsUpdate] = useState(false);
  useEffect(() => {
    if (needsUpdate) {
      setNeedsUpdate(false);
    }
  }, [needsUpdate]);

  // Populate the props.query with defaults on mount
  useEffect(() => {
    props.onChange(queryWithDefaults);
    // Run only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const templateVariables = props.datasource.getVariables();

  const fetchRegions = async () =>
    await props.datasource
      .getRegions()
      .then((regions) => appendTemplateVariables(templateVariables, regions))
      .finally(() => setNeedsUpdate(true));
  const fetchCatalogs = async () =>
    await props.datasource
      .getCatalogs(queryWithDefaults)
      .then((catalogs) => appendTemplateVariables(templateVariables, catalogs))
      .finally(() => setNeedsUpdate(true));
  const fetchDatabases = async () =>
    await props.datasource
      .getDatabases(queryWithDefaults)
      .then((databases) => appendTemplateVariables(templateVariables, databases))
      .finally(() => setNeedsUpdate(true));
  const fetchTables = async () =>
    await props.datasource
      .getTables(queryWithDefaults)
      .then((tables) => appendTemplateVariables(templateVariables, tables))
      .finally(() => setNeedsUpdate(true));
  const fetchColumns = async () =>
    await props.datasource
      .getColumns(queryWithDefaults)
      .then((columns) => appendTemplateVariables(templateVariables, columns))
      .finally(() => setNeedsUpdate(true));

  const onChange = (prop: QueryEditorFieldType) => (e: SelectableValue<string> | null) => {
    const newQuery = { ...props.query };
    const value = e?.value;
    switch (prop) {
      case QueryEditorFieldType.Regions:
        newQuery.connectionArgs = { ...newQuery.connectionArgs, region: value };
        break;
      case QueryEditorFieldType.Catalogs:
        newQuery.connectionArgs = { ...newQuery.connectionArgs, catalog: value };
        break;
      case QueryEditorFieldType.Databases:
        newQuery.connectionArgs = { ...newQuery.connectionArgs, database: value };
        break;
      case QueryEditorFieldType.Tables:
        newQuery.table = value;
        break;
      case QueryEditorFieldType.Columns:
        newQuery.column = value;
        break;
    }
    props.onChange(newQuery);
  };

  return (
    <EditorRows>
      <EditorRow>
        <EditorFieldGroup>
          <EditorField
            width={15}
            label={selectors.components.ConfigEditor.region.input}
            data-testid={selectors.components.ConfigEditor.region.wrapper}
            htmlFor={QueryEditorFieldType.Regions}
          >
            <ResourceSelector
              id={QueryEditorFieldType.Regions}
              onChange={onChange(QueryEditorFieldType.Regions)}
              fetch={fetchRegions}
              value={queryWithDefaults.connectionArgs.region ?? null}
              default={props.datasource.defaultRegion}
              label={selectors.components.ConfigEditor.region.input}
            />
          </EditorField>
          <EditorField
            width={15}
            label={selectors.components.ConfigEditor.catalog.input}
            data-testid={selectors.components.ConfigEditor.catalog.wrapper}
            htmlFor={QueryEditorFieldType.Catalogs}
          >
            <ResourceSelector
              id={QueryEditorFieldType.Catalogs}
              onChange={onChange(QueryEditorFieldType.Catalogs)}
              fetch={fetchCatalogs}
              value={queryWithDefaults.connectionArgs.catalog ?? null}
              default={props.datasource.defaultCatalog}
              dependencies={[queryWithDefaults.connectionArgs.region]}
              label={selectors.components.ConfigEditor.catalog.input}
            />
          </EditorField>
        </EditorFieldGroup>

        <EditorFieldGroup>
          <EditorField
            width={20}
            label={selectors.components.ConfigEditor.database.input}
            data-testid={selectors.components.ConfigEditor.database.wrapper}
            htmlFor={QueryEditorFieldType.Databases}
          >
            <ResourceSelector
              id={QueryEditorFieldType.Databases}
              onChange={onChange(QueryEditorFieldType.Databases)}
              fetch={fetchDatabases}
              value={queryWithDefaults.connectionArgs.database ?? null}
              default={props.datasource.defaultDatabase}
              dependencies={[queryWithDefaults.connectionArgs.catalog]}
              label={selectors.components.ConfigEditor.database.input}
            />
          </EditorField>
          <EditorField
            width={20}
            label={selectors.components.ConfigEditor.table.input}
            data-testid={selectors.components.ConfigEditor.table.wrapper}
            tooltip="Use the selected table with the $__table macro"
            htmlFor={QueryEditorFieldType.Tables}
          >
            <ResourceSelector
              id={QueryEditorFieldType.Tables}
              onChange={onChange(QueryEditorFieldType.Tables)}
              fetch={fetchTables}
              value={props.query.table || null}
              dependencies={[queryWithDefaults.connectionArgs.database]}
              label={selectors.components.ConfigEditor.table.input}
            />
          </EditorField>
          <EditorField
            width={20}
            label={selectors.components.ConfigEditor.column.input}
            data-testid={selectors.components.ConfigEditor.column.wrapper}
            tooltip="Use the selected column with the $__column macro"
            htmlFor={QueryEditorFieldType.Columns}
          >
            <ResourceSelector
              id={QueryEditorFieldType.Columns}
              label={selectors.components.ConfigEditor.column.input}
              onChange={onChange(QueryEditorFieldType.Columns)}
              fetch={fetchColumns}
              value={props.query.column || null}
              dependencies={[queryWithDefaults.table]}
            />
          </EditorField>
        </EditorFieldGroup>
        {!props.hideOptions && (
          <EditorFieldGroup>
            <EditorField label="Format data frames as" htmlFor="formatAs" width={20}>
              <FormatSelect
                id="formatAs"
                query={props.query}
                options={SelectableFormatOptions}
                onChange={props.onChange}
              />
            </EditorField>
          </EditorFieldGroup>
        )}
      </EditorRow>
      <EditorRow>
        <div className={styles.collapseRow}>
          {/* temporary solution until we have a collapse section compatible with Editor Fields in grafana/ui */}
          <CollapsableSection
            className={styles.collapse}
            label={
              <p className={styles.collapseTitle}>
                Query result reuse{' '}
                {!resultReuseSupported && <span className={styles.optional}>(engine version 3 only)</span>}
              </p>
            }
            isOpen={!!props.query.connectionArgs?.resultReuseEnabled}
          >
            <ResultReuse enabled={resultReuseSupported} query={props.query} onChange={props.onChange} />
          </CollapsableSection>
        </div>
      </EditorRow>
      <EditorRow>
        <div className={styles.sqlEditor}>
          <SQLEditor query={props.query} onChange={props.onChange} datasource={props.datasource} />
        </div>
      </EditorRow>
    </EditorRows>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  optional: css({
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
  }),
  collapseTitle: css({
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 0,
  }),
  collapse: css({
    alignItems: 'flex-start',
  }),
  collapseRow: css({
    display: 'flex',
    flexDirection: 'column',
    '>div': {
      alignItems: 'baseline',
      justifyContent: 'flex-end',
    },
    '*[id^="collapse-content-"]': {
      padding: 'unset',
    },
  }),
  sqlEditor: css({
    width: '100%',
  }),
});
