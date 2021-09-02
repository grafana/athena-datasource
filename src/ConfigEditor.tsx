import React, { useState } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData, AthenaDataSourceSettings, defaultKey } from './types';
import { ConnectionConfig } from '@grafana/aws-sdk';
import { getBackendSrv } from '@grafana/runtime';
import { AthenaResourceSelector } from './AthenaResourceSelector';

type Props = DataSourcePluginOptionsEditorProps<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;

export type ResourceType = 'catalog' | 'database' | 'workgroup';

export function ConfigEditor(props: Props) {
  const baseURL = `/api/datasources/${props.options.id}`;
  const resourcesURL = `${baseURL}/resources`;
  const { jsonData } = props.options;
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
  const [catalog, setCatalog] = useState<string | null>(jsonData.catalog || null);
  const fetchCatalogs = async () => {
    const res: string[] = await getBackendSrv().post(resourcesURL + '/catalogs', {
      region: defaultKey,
    });
    return res;
  };
  // Databases
  const [database, setDatabase] = useState<string | null>(jsonData.database || null);
  const fetchDatabases = async () => {
    const loadedDatabases: string[] = await getBackendSrv().post(resourcesURL + '/databases', {
      region: defaultKey,
      catalog: catalog || defaultKey,
    });
    return loadedDatabases;
  };
  // Workgroups
  const [workgroup, setWorkgroup] = useState<string | null>(jsonData.workgroup || null);
  const fetchWorkgroups = async () => {
    const loadedWorkgroups: string[] = await getBackendSrv().post(resourcesURL + '/workgroups', {
      region: defaultKey,
    });
    return loadedWorkgroups;
  };

  const onOptionsChange = (options: DataSourceSettings<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>) => {
    // clean up related state
    setSaved(false);
    setCatalog(null);
    setDatabase(null);
    setWorkgroup(null);
    props.onOptionsChange(options);
  };

  const onCatalogChange = (catalog: string | null) => {
    setCatalog(catalog);
    props.onOptionsChange({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        catalog: catalog || '',
      },
    });
  };

  const onDatabaseChange = (database: string | null) => {
    setDatabase(database);
    props.onOptionsChange({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        database: database || '',
      },
    });
  };

  const onWorkgroupChange = (workgroup: string | null) => {
    setWorkgroup(workgroup);
    props.onOptionsChange({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        workgroup: workgroup || '',
      },
    });
  };

  const commonProps = {
    title: jsonData.defaultRegion ? '' : 'select a default region',
    disabled: !jsonData.defaultRegion,
    labelWidth: 28,
    className: 'width-30',
  };
  return (
    <div className="gf-form-group">
      <ConnectionConfig {...props} onOptionsChange={onOptionsChange} />
      <h3>Athena Details </h3>
      <AthenaResourceSelector
        resource="catalog"
        onChange={onCatalogChange}
        fetch={fetchCatalogs}
        value={catalog}
        saveOptions={saveOptions}
        {...commonProps}
      />
      <AthenaResourceSelector
        resource="database"
        onChange={onDatabaseChange}
        fetch={fetchDatabases}
        value={database}
        saveOptions={saveOptions}
        dependencies={[catalog]}
        {...commonProps}
      />
      <AthenaResourceSelector
        resource="workgroup"
        onChange={onWorkgroupChange}
        fetch={fetchWorkgroups}
        value={workgroup}
        saveOptions={saveOptions}
        {...commonProps}
      />
    </div>
  );
}
