import React, { useState } from 'react';
import {
  DataSourcePluginOptionsEditorProps,
  DataSourceSettings,
  onUpdateDatasourceJsonDataOption,
  SelectableValue,
} from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData, AthenaDataSourceSettings } from './types';
import { ConnectionConfig } from '@grafana/aws-sdk';
import { Select, InlineField, Input } from '@grafana/ui';
import { selectors } from './tests/selectors';
import { getBackendSrv } from '@grafana/runtime';

type Props = DataSourcePluginOptionsEditorProps<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;

export function ConfigEditor(props: Props) {
  const baseURL = `/api/datasources/${props.options.id}`;
  const resourcesURL = `${baseURL}/resources`;
  const [catalogs, setCatalogs] = useState<string[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);
  const [catalog, setCatalog] = useState<SelectableValue<string> | null>(null);

  const saveOptions = async () => {
    await getBackendSrv()
      .put(baseURL, props.options)
      .then((result: { datasource: AthenaDataSourceSettings }) => {
        props.onOptionsChange({
          ...props.options,
          version: result.datasource.version,
        });
      });
  };

  const onLoadCatalogs = async () => {
    if (catalogs.length) {
      return;
    }
    await saveOptions();
    setIsLoadingCatalogs(true);
    try {
      const loadedCatalogs: string[] = await getBackendSrv().post(resourcesURL + '/catalogs', {
        region: 'default',
      });
      setCatalogs(loadedCatalogs);
    } finally {
      setIsLoadingCatalogs(false);
    }
  };

  const onCatalogChange = (e: SelectableValue<string>) => {
    const value = e.value || '';
    setCatalog({ label: value, value });
    props.onOptionsChange({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        catalog: value,
      },
    });
  };

  const onOptionsChange = (options: DataSourceSettings<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>) => {
    // clean up related state
    setCatalogs([]);
    setCatalog(null);
    props.onOptionsChange(options);
  };

  return (
    <div className="gf-form-group">
      <ConnectionConfig {...props} onOptionsChange={onOptionsChange} />
      <h3>Athena Details </h3>
      <InlineField label="Catalog (datasource)" labelWidth={28}>
        <div
          data-testid="onloadcatalogs"
          onClick={onLoadCatalogs}
          title={props.options.jsonData.defaultRegion ? '' : 'select a default region'}
        >
          <Select
            data-testid={selectors.components.ConfigEditor.Catalog.input}
            aria-label="Catalog (datasource)"
            options={catalogs.map((c) => ({ label: c, value: c }))}
            value={catalog}
            onChange={onCatalogChange}
            className="width-30"
            isLoading={isLoadingCatalogs}
            disabled={!props.options.jsonData.defaultRegion}
          />
        </div>
      </InlineField>
      <InlineField label="Database" labelWidth={28}>
        <Input
          data-testid={selectors.components.ConfigEditor.Database.input}
          css={{}}
          className="width-30"
          value={props.options.jsonData.database}
          onChange={onUpdateDatasourceJsonDataOption(props, 'database')}
        />
      </InlineField>
      <InlineField label="Workgroup" labelWidth={28}>
        <Input
          data-testid={selectors.components.ConfigEditor.Workgroup.input}
          css={{}}
          className="width-30"
          value={props.options.jsonData.workgroup}
          onChange={onUpdateDatasourceJsonDataOption(props, 'workgroup')}
        />
      </InlineField>
    </div>
  );
}
