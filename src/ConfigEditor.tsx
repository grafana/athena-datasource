import React, { useState, FormEvent } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings, SelectableValue } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData, AthenaDataSourceSettings } from './types';
import { getBackendSrv } from '@grafana/runtime';
import { InlineInput, ConfigSelect, ConnectionConfig } from '@grafana/aws-sdk';
import { selectors } from 'tests/selectors';

type Props = DataSourcePluginOptionsEditorProps<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;

export type ResourceType = 'catalog' | 'database' | 'workgroup';

export function ConfigEditor(props: Props) {
  const baseURL = `/api/datasources/${props.options.id}`;
  const resourcesURL = `${baseURL}/resources`;
  const [saved, setSaved] = useState(!!props.options.jsonData.defaultRegion);
  const saveOptions = async () => {
    if (saved) {
      return;
    }
    await getBackendSrv()
      .put(baseURL, props.options)
      .then((result: { datasource: AthenaDataSourceSettings }) => {
        props.onOptionsChange({
          ...props.options,
          version: result.datasource.version,
        });
      });
    setSaved(true);
  };

  // Catalogs
  const fetchCatalogs = async () => {
    const res: string[] = await getBackendSrv().post(resourcesURL + '/catalogs', {
      region: props.options.jsonData.defaultRegion,
    });
    return res;
  };
  // Databases
  const fetchDatabases = async () => {
    const loadedDatabases: string[] = await getBackendSrv().post(resourcesURL + '/databases', {
      region: props.options.jsonData.defaultRegion,
      catalog: props.options.jsonData.catalog,
    });
    return loadedDatabases;
  };
  // Workgroups
  const fetchWorkgroups = async () => {
    const loadedWorkgroups: string[] = await getBackendSrv().post(resourcesURL + '/workgroups', {
      region: props.options.jsonData.defaultRegion,
    });
    return loadedWorkgroups;
  };

  const onOptionsChange = (options: DataSourceSettings<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>) => {
    setSaved(false);
    props.onOptionsChange(options);
  };

  const onChange = (resource: ResourceType) => (e: SelectableValue<string> | null) => {
    const value = e?.value ?? '';
    props.onOptionsChange({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        [resource]: value,
      },
    });
  };

  const onChangeOutputLocation = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    props.onOptionsChange({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        outputLocation: value,
      },
    });
  };

  return (
    <div className="gf-form-group">
      <ConnectionConfig {...props} onOptionsChange={onOptionsChange} />
      <h3>Athena Details</h3>
      <ConfigSelect
        {...props}
        value={props.options.jsonData.catalog ?? ''}
        onChange={onChange('catalog')}
        fetch={fetchCatalogs}
        label={selectors.components.ConfigEditor.catalog.input}
        data-testid={selectors.components.ConfigEditor.catalog.wrapper}
        saveOptions={saveOptions}
      />
      <ConfigSelect
        {...props}
        value={props.options.jsonData.database ?? ''}
        onChange={onChange('database')}
        fetch={fetchDatabases}
        label={selectors.components.ConfigEditor.database.input}
        data-testid={selectors.components.ConfigEditor.database.wrapper}
        dependencies={[props.options.jsonData.catalog || '']}
        saveOptions={saveOptions}
      />
      <ConfigSelect
        {...props}
        value={props.options.jsonData.workgroup ?? ''}
        onChange={onChange('workgroup')}
        fetch={fetchWorkgroups}
        label={selectors.components.ConfigEditor.workgroup.input}
        data-testid={selectors.components.ConfigEditor.workgroup.wrapper}
        saveOptions={saveOptions}
      />
      <InlineInput
        {...props}
        value={props.options.jsonData.outputLocation ?? ''}
        onChange={onChangeOutputLocation}
        label={selectors.components.ConfigEditor.OuputLocation.input}
        data-testid={selectors.components.ConfigEditor.OuputLocation.wrapper}
        tooltip="Optional. If not specified, the default query result location from the Workgroup configuration will be used."
        placeholder="s3://"
      />
    </div>
  );
}
