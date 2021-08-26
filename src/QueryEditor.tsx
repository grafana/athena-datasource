import { defaults } from 'lodash';

import React, { useState, useEffect, useMemo } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery } from './types';
import { CodeEditor, InlineField, InlineSegmentGroup, Select } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const { rawSQL } = defaults(props.query, defaultQuery);
  // Region selector
  const defaultRegionOpt = useMemo(
    () => ({
      label: `default (${props.datasource.defaultRegion})`,
      value: 'default',
      description: 'Default region set in the data source',
    }),
    [props.datasource.defaultRegion]
  );
  const [regionOptions, setRegionOptions] = useState<Array<SelectableValue<string>>>([defaultRegionOpt]);
  const [regionsFetched, setRegionsFetched] = useState(false);
  const region = props.query.connectionArgs?.region || defaultRegionOpt.value;
  // Catalog selector
  const defaultCatalogOpt = useMemo(
    () => ({
      label: `default (${props.datasource.defaultCatalog})`,
      value: 'default',
      description: 'Default catalog set in the data source',
    }),
    [props.datasource.defaultCatalog]
  );
  const [catalogOptions, setCatalogOptions] = useState<Array<SelectableValue<string>>>([defaultCatalogOpt]);
  const [catalogsFetched, setCatalogsFetched] = useState(false);
  const catalog = props.query.connectionArgs?.region || defaultCatalogOpt.value;

  useEffect(() => {
    if (!regionsFetched) {
      setRegionsFetched(true);
      props.datasource.getResource('regions').then((regions: string[]) => {
        if (!regions.length) {
          return;
        }
        // place the default option at the top
        const options: Array<SelectableValue<string>> = [defaultRegionOpt];
        regions.forEach((r) => {
          if (r !== props.datasource.defaultRegion) {
            options.push({ label: r, value: r });
          }
        });
        setRegionOptions(options);
      });
    }
  }, [defaultRegionOpt, regionsFetched, props.datasource]);

  useEffect(() => {
    if (!catalogsFetched) {
      setCatalogsFetched(true);
      props.datasource.postResource('catalogs', { region }).then((catalogs: string[]) => {
        if (!catalogs.length) {
          return;
        }
        // place the default option at the top
        const options: Array<SelectableValue<string>> = [defaultCatalogOpt];
        catalogs.forEach((r) => {
          if (r !== props.datasource.defaultCatalog) {
            options.push({ label: r, value: r });
          }
        });
        setCatalogOptions(options);
      });
    }
  }, [defaultCatalogOpt, catalogsFetched, props.datasource, region]);

  const onRawSqlChange = (rawSQL: string) => {
    const query = {
      ...props.query,
      rawSQL,
    };
    props.onChange(query);
    props.onRunQuery();
  };

  const onRegionChange = (e: SelectableValue<string>) => {
    const query = {
      ...props.query,
      connectionArgs: {
        ...props.query.connectionArgs,
        region: e.value || props.datasource.defaultRegion,
      },
    };
    props.onChange(query);
    props.onRunQuery();
    // reset the catalog to re-request it
    setCatalogsFetched(false);
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
      <InlineSegmentGroup>
        <InlineField label="Region">
          <Select aria-label="Region" options={regionOptions} value={region} onChange={onRegionChange} />
        </InlineField>
        <InlineField label="Catalog (datasource)">
          <Select
            aria-label="Catalog (datasource)"
            options={catalogOptions}
            value={catalog}
            onChange={onRegionChange}
          />
        </InlineField>
      </InlineSegmentGroup>
    </>
  );
}
