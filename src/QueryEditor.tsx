import { defaults } from 'lodash';

import React, { useState, useEffect } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { AthenaDataSourceOptions, AthenaQuery, defaultQuery } from './types';
import { CodeEditor, InlineField, Select } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>;

export function QueryEditor(props: Props) {
  const { rawSQL } = defaults(props.query, defaultQuery);
  const [region, setRegion] = useState(props.query.connectionArgs?.region || props.datasource.defaultRegion);
  const defaultRegionOpt = {
    label: props.datasource.defaultRegion,
    value: props.datasource.defaultRegion,
    description: 'Default',
  };
  const [regionOptions, setRegionOptions] = useState<SelectableValue<string>[]>([defaultRegionOpt]);

  useEffect(() => {
    if (regionOptions.length === 1) {
      props.datasource.getResource('regions').then((regions: string[]) => {
        // place the default option at the top
        const options: SelectableValue<string>[] = [defaultRegionOpt];
        regions.forEach((r) => {
          if (r !== props.datasource.defaultRegion) {
            options.push({ label: r, value: r });
          }
        });
        setRegionOptions(options);
      });
    }
  }, [regionOptions]);

  const onRawSqlChange = (rawSQL: string, region?: string) => {
    const query = {
      ...props.query,
      rawSQL,
    };
    if (region) {
      query.connectionArgs = {
        ...query.connectionArgs,
        region,
      };
    }
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
          value={region}
          onChange={(v) => {
            setRegion(v.value || '');
            onRawSqlChange(rawSQL, v.value);
          }}
        />
      </InlineField>
    </>
  );
}
