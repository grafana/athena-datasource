import { defaults } from 'lodash';

import React, { useState } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery, FormatOptions, SelectableFormatOptions } from './types';
import { InlineField, InlineSegmentGroup, Select } from '@grafana/ui';
import { AthenaResourceSelector } from 'AthenaResourceSelector';
import { QueryCodeEditor } from 'QueryCodeEditor';
import { ResourceMacros } from 'ResourceMacros';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const { connectionArgs, format } = defaults(props.query, defaultQuery);
  // Region selector
  const [region, setRegion] = useState(connectionArgs.region);
  const fetchRegions = async () => {
    const regions = await props.datasource.getResource('regions');
    return regions;
  };
  // Catalog selector
  const [catalog, setCatalog] = useState<string | null>(connectionArgs.catalog);
  const fetchCatalogs = async () => await props.datasource.postResource('catalogs', { region });
  // Database selector
  const [database, setDatabase] = useState<string | null>(connectionArgs.database);
  const fetchDatabases = async () => await props.datasource.postResource('databases', { region, catalog });

  const onRegionChange = (region: string | null) => {
    setRegion(region || '');
    props.onChange({
      ...props.query,
      table: '',
      column: '',
      connectionArgs: {
        ...connectionArgs,
        region: region || '',
      },
    });
  };

  const onCatalogChange = (catalog: string | null) => {
    setCatalog(catalog);
    props.onChange({
      ...props.query,
      table: '',
      column: '',
      connectionArgs: {
        ...connectionArgs,
        catalog: catalog || '',
      },
    });
  };

  const onDatabaseChange = (database: string | null) => {
    setDatabase(database);
    props.onChange({
      ...props.query,
      table: '',
      column: '',
      connectionArgs: {
        ...connectionArgs,
        database: database || '',
      },
    });
    // now that connection args are complete, run request
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
      <ResourceMacros
        query={props.query}
        datasource={props.datasource}
        onChange={props.onChange}
        onRunQuery={props.onRunQuery}
        dependencies={[region, catalog, database].join('')}
      />
      <QueryCodeEditor query={props.query} onChange={props.onChange} onRunQuery={props.onRunQuery} />
      <InlineField label="Format as">
        <Select options={SelectableFormatOptions} value={format} onChange={onChangeFormat} />
      </InlineField>
      <h6 style={{ marginTop: '10px' }}>Connection Details</h6>
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
