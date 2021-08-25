import { defaults } from 'lodash';

import React, { useState, useEffect } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery } from './types';
import { CodeEditor, InlineField, Select } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const { rawSQL } = defaults(props.query, defaultQuery);
  const defaultRegionOpt = {
    label: `default (${props.datasource.defaultRegion})`,
    value: 'default',
    description: 'Default region set in the data source',
  };
  const [regionOptions, setRegionOptions] = useState<Array<SelectableValue<string>>>([defaultRegionOpt]);

  useEffect(() => {
    if (regionOptions.length === 1) {
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
  }, [defaultRegionOpt, regionOptions, props.datasource]);

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
      <InlineField label="Region">
        <Select
          aria-label="Region"
          options={regionOptions}
          value={props.query.connectionArgs?.region || defaultRegionOpt.value}
          onChange={onRegionChange}
        />
      </InlineField>
    </>
  );
}
