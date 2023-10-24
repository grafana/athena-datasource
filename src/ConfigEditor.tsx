import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings, SelectableValue } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData, AthenaDataSourceSettings, defaultKey } from './types';
import { config, getBackendSrv } from '@grafana/runtime';
import { AwsAuthType, ConfigSelect, ConnectionConfig, Divider, InlineInput } from '@grafana/aws-sdk';
import { selectors } from 'tests/selectors';
import { ConfigSection } from '@grafana/experimental';
import { Field, Input } from '@grafana/ui';

type Props = DataSourcePluginOptionsEditorProps<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;

export type ResourceType = 'catalog' | 'database' | 'workgroup';

export function ConfigEditor(props: Props) {
  const baseURL = `/api/datasources/${props.options.id}`;
  const resourcesURL = `${baseURL}/resources`;
  const [saved, setSaved] = useState(!!props.options.jsonData.defaultRegion);
  const [externalId, setExternalId] = useState('');
  // @ts-ignore
  const newFormStylingEnabled = config.featureToggles.awsDatasourcesNewFormStyling;

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
      region: defaultKey,
    });
    return res;
  };
  // Databases
  const fetchDatabases = async () => {
    const loadedDatabases: string[] = await getBackendSrv().post(resourcesURL + '/databases', {
      region: defaultKey,
      catalog: props.options.jsonData.catalog,
    });
    return loadedDatabases;
  };
  // Workgroups
  const fetchWorkgroups = async () => {
    const loadedWorkgroups: string[] = await getBackendSrv().post(resourcesURL + '/workgroups', {
      region: defaultKey,
    });
    return loadedWorkgroups;
  };

  const fetchExternalId = useCallback(async () => {
    try {
      const response = await getBackendSrv().post(resourcesURL + '/externalId', {});
      setExternalId(response.externalId);
    } catch {
      setExternalId('');
    }
  }, [resourcesURL]);

  useEffect(() => {
    if (props.options.jsonData.authType === AwsAuthType.GrafanaAssumeRole) {
      fetchExternalId();
    }
  }, [props.options.jsonData.authType, fetchExternalId]);

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
    <div className="width-30">
      <ConnectionConfig
        {...props}
        onOptionsChange={onOptionsChange}
        newFormStylingEnabled={newFormStylingEnabled}
        externalId={externalId}
      />
      {newFormStylingEnabled ? (
        <>
          <Divider />
          <ConfigSection title="Athena Details">
            <Field
              label={selectors.components.ConfigEditor.catalog.input}
              htmlFor="catalog"
              data-testid={selectors.components.ConfigEditor.catalog.wrapper}
            >
              <ConfigSelect
                {...props}
                id="catalog"
                value={props.options.jsonData.catalog ?? ''}
                onChange={onChange('catalog')}
                fetch={fetchCatalogs}
                label={selectors.components.ConfigEditor.catalog.input}
                saveOptions={saveOptions}
                newFormStylingEnabled={true}
              />
            </Field>
            <Field
              label={selectors.components.ConfigEditor.database.input}
              htmlFor="database"
              data-testid={selectors.components.ConfigEditor.database.wrapper}
            >
              <ConfigSelect
                {...props}
                id="database"
                value={props.options.jsonData.database ?? ''}
                onChange={onChange('database')}
                fetch={fetchDatabases}
                label={selectors.components.ConfigEditor.database.input}
                dependencies={[props.options.jsonData.catalog || '']}
                saveOptions={saveOptions}
                newFormStylingEnabled={true}
              />
            </Field>
            <Field
              label={selectors.components.ConfigEditor.workgroup.input}
              htmlFor="workgroup"
              data-testid={selectors.components.ConfigEditor.workgroup.wrapper}
            >
              <ConfigSelect
                {...props}
                id="workgroup"
                value={props.options.jsonData.workgroup ?? ''}
                onChange={onChange('workgroup')}
                fetch={fetchWorkgroups}
                label={selectors.components.ConfigEditor.workgroup.input}
                saveOptions={saveOptions}
                newFormStylingEnabled={true}
              />
            </Field>
            <Field
              label={selectors.components.ConfigEditor.OutputLocation.input}
              description="Optional. If not specified, the default query result location from the Workgroup configuration will be used."
              placeholder="s3://"
              htmlFor="outputLocation"
            >
              <Input
                {...props}
                id="outputLocation"
                value={props.options.jsonData.outputLocation ?? ''}
                onChange={onChangeOutputLocation}
                data-testid={selectors.components.ConfigEditor.OutputLocation.wrapper}
              />
            </Field>
          </ConfigSection>
        </>
      ) : (
        <>
          <h3>Athena Details</h3>
          <ConfigSelect
            {...props}
            id="catalog"
            value={props.options.jsonData.catalog ?? ''}
            onChange={onChange('catalog')}
            fetch={fetchCatalogs}
            label={selectors.components.ConfigEditor.catalog.input}
            data-testid={selectors.components.ConfigEditor.catalog.wrapper}
            saveOptions={saveOptions}
          />
          <ConfigSelect
            {...props}
            id="database"
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
            id="workgroup"
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
            label={selectors.components.ConfigEditor.OutputLocation.input}
            data-testid={selectors.components.ConfigEditor.OutputLocation.wrapper}
            tooltip="Optional. If not specified, the default query result location from the Workgroup configuration will be used."
            placeholder="s3://"
          />
        </>
      )}
    </div>
  );
}
