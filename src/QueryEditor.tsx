import React, { useCallback, useEffect, useState } from 'react';
import { config } from '@grafana/runtime';
import { QueryEditorProps } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { DataSource } from './datasource';
import { QueryEditorForm } from './QueryEditorForm';
import { QueryEditorHeader } from '@grafana/aws-sdk';

export function QueryEditor(props: QueryEditorProps<DataSource, AthenaQuery, AthenaDataSourceOptions>) {
  const [dataIsStale, setDataIsStale] = useState(false);
  const { onChange } = props;

  useEffect(() => {
    setDataIsStale(false);
  }, [props.data]);

  const onChangeInternal = useCallback(
    (query: AthenaQuery) => {
      setDataIsStale(true);
      onChange(query);
    },
    [onChange]
  );

  return (
    <>
      {props?.app !== 'explore' && (
        <QueryEditorHeader<DataSource, AthenaQuery, AthenaDataSourceOptions>
          {...props}
          enableRunButton={dataIsStale && !!props.query.rawSQL}
          showAsyncQueryButtons={config.featureToggles.athenaAsyncQueryDataSupport}
          cancel={config.featureToggles.athenaAsyncQueryDataSupport ? props.datasource.cancel : undefined}
        />
      )}
      <QueryEditorForm {...props} onChange={onChangeInternal} />
    </>
  );
}
