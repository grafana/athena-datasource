import { defaults } from 'lodash';

import React, { useState } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery } from './types';
import { CodeEditor, InlineSegmentGroup } from '@grafana/ui';
import { AthenaResourceSelector } from 'AthenaResourceSelector';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const { rawSQL } = defaults(props.query, defaultQuery);
  // Region selector
  const [region, setRegion] = useState(props.query.connectionArgs.region);
  const fetchRegions = async () => {
    const regions = await props.datasource.getResource('regions');
    return regions;
  };
  // Catalog selector
  const [catalog, setCatalog] = useState<string | null>(props.query.connectionArgs.catalog);
  const fetchCatalogs = async () => await props.datasource.postResource('catalogs', { region });
  // Database selector
  const [database, setDatabase] = useState<string | null>(props.query.connectionArgs.database);
  const fetchDatabases = async () => await props.datasource.postResource('databases', { region, catalog });

  const onRawSqlChange = (rawSQL: string) => {
    const query = {
      ...props.query,
      rawSQL,
    };
    props.onChange(query);
    props.onRunQuery();
  };

  const onRegionChange = (region: string | null) => {
    setRegion(region || '');
    props.onChange({
      ...props.query,
      connectionArgs: {
        ...props.query.connectionArgs,
        region: region || '',
      },
    });
  };

  const onCatalogChange = (catalog: string | null) => {
    setCatalog(catalog);
    props.onChange({
      ...props.query,
      connectionArgs: {
        ...props.query.connectionArgs,
        catalog: catalog || '',
      },
    });
  };

  const onDatabaseChange = (database: string | null) => {
    setDatabase(database);
    props.onChange({
      ...props.query,
      connectionArgs: {
        ...props.query.connectionArgs,
        database: database || '',
      },
    });
    // now that connection args are complete, run request
    props.onRunQuery();
  };

  return (
    <>
      <CodeEditor
        height={'250px'}
        language={'sql'}
        value={rawSQL}
        onBlur={onRawSqlChange}
        onSave={onRawSqlChange}
        showMiniMap={false}
        showLineNumbers={true}
      />
      <h6>Connection Details</h6>
      <InlineSegmentGroup>
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
      </InlineSegmentGroup>
    </>
  );
}
