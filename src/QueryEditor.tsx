import React, { useCallback, useEffect, useState } from 'react';
import { config } from '@grafana/runtime';
<<<<<<< HEAD
import { QueryEditorProps } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaQuery } from './types';
import { DataSource } from './datasource';
import { QueryEditorForm } from './QueryEditorForm';
import { QueryEditorHeader } from '@grafana/aws-sdk';
||||||| parent of cca27f8 (update import)
import { FormatSelect, ResourceSelector } from '@grafana/aws-sdk';
import { RunQueryButtons } from '@grafana/async-query-data';
import { selectors } from 'tests/selectors';
import { appendTemplateVariables } from 'utils';
import SQLEditor from 'SQLEditor';
import { ResultReuse } from 'ResultReuse/ResultReuse';
=======
import { FormatSelect, ResourceSelector } from '@grafana/aws-sdk';
import { RunQueryButtons } from '@grafana/async-query-data';
import { selectors } from 'tests/selectors';
import { appendTemplateVariables } from 'utils';
import SQLEditor from 'SQLEditor';
import { ResultReuse } from 'ResultReuse';
>>>>>>> cca27f8 (update import)

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
