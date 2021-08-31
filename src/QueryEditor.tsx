import { defaults } from 'lodash';

import React, { useState } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery } from './types';
import { CodeEditor, InlineSegmentGroup } from '@grafana/ui';
import { AthenaResourceSelector, QueryResourceType } from './AthenaResourceSelector';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const { rawSQL } = defaults(props.query, defaultQuery);
  // Region selector
  const [region, setRegion] = useState(props.query.connectionArgs.region);
  const [regions, setRegions] = useState([props.query.connectionArgs.region]);
  const [regionsFetched, setRegionsFetched] = useState(false);
  const fetchRegions = async () => {
    if (regionsFetched) {
      return;
    }
    try {
      const regions = await props.datasource.getResource('regions');
      setRegions(regions);
    } finally {
      // avoid re-fetching even if there are errors
      setRegionsFetched(true);
    }
  };
  // Catalog selector
  const [catalog, setCatalog] = useState<string | null>(props.query.connectionArgs.catalog);
  const [catalogs, setCatalogs] = useState([props.query.connectionArgs.catalog]);
  const [catalogsFetched, setCatalogsFetched] = useState(false);
  const fetchCatalogs = async () => {
    if (catalogsFetched) {
      return;
    }
    try {
      setCatalogs(await props.datasource.postResource('catalogs', { region }));
    } finally {
      // avoid re-fetching even if there are errors
      setCatalogsFetched(true);
    }
  };
  // Database selector
  const [database, setDatabase] = useState<string | null>(props.query.connectionArgs.database);
  const [databases, setDatabases] = useState([props.query.connectionArgs.database]);
  const [databasesFetched, setDatabasesFetched] = useState(false);
  const fetchDatabases = async () => {
    if (databasesFetched) {
      return;
    }
    try {
      setDatabases(await props.datasource.postResource('databases', { region, catalog }));
    } finally {
      // avoid re-fetching even if there are errors
      setDatabasesFetched(true);
    }
  };

  const onRawSqlChange = (rawSQL: string) => {
    const query = {
      ...props.query,
      rawSQL,
    };
    props.onChange(query);
    props.onRunQuery();
  };

  const onResourceChange = (r: QueryResourceType) => (value: string) => {
    const newArgs = {
      ...props.query.connectionArgs,
    };
    switch (r) {
      case 'region':
        setRegion(value);
        newArgs.region = value;
        // reset the related state
        newArgs.catalog = '';
        newArgs.database = '';
        setCatalog(null);
        setCatalogs([]);
        setCatalogsFetched(false);
        setDatabase(null);
        setDatabases([]);
        setDatabasesFetched(false);
        break;
      case 'catalog':
        setCatalog(value);
        newArgs.catalog = value;
        // reset the related state
        newArgs.database = '';
        setDatabase(null);
        setDatabases([]);
        setDatabasesFetched(false);
        break;
      case 'database':
        setDatabase(value);
        newArgs.database = value;
        // now that connection args are complete, run request
        props.onRunQuery();
    }
    const query = {
      ...props.query,
      connectionArgs: {
        ...props.query.connectionArgs,
        ...newArgs,
      },
    };
    props.onChange(query);
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
          default={props.datasource.defaultRegion}
          value={region}
          list={regions}
          fetch={fetchRegions}
          onChange={onResourceChange('region')}
        />
        <AthenaResourceSelector
          resource="catalog"
          default={props.datasource.defaultCatalog}
          value={catalog}
          list={catalogs}
          fetch={fetchCatalogs}
          onChange={onResourceChange('catalog')}
        />
        <AthenaResourceSelector
          resource="database"
          default={props.datasource.defaultDatabase}
          value={database}
          list={databases}
          fetch={fetchDatabases}
          onChange={onResourceChange('database')}
        />
      </InlineSegmentGroup>
    </>
  );
}
