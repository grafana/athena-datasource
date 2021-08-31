import React, { useState } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData, AthenaDataSourceSettings } from './types';
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
  const [catalogs, setCatalogs] = useState<string[]>(catalog ? [catalog] : []);
  const [catalogsFetched, setCatalogsFetched] = useState(false);
  const fetchCatalogs = async () => {
    if (catalogsFetched) {
      return;
    }
    await saveOptions();
    try {
      const loadedCatalogs: string[] = await getBackendSrv().post(resourcesURL + '/catalogs', {
        region: 'default',
      });
      setCatalogs(loadedCatalogs);
    } finally {
      setCatalogsFetched(true);
    }
  };
  // Databases
  const [database, setDatabase] = useState<string | null>(jsonData.database || null);
  const [databases, setDatabases] = useState<string[]>(database ? [database] : []);
  const [databasesFetched, setDatabasesFetched] = useState(false);
  const fetchDatabases = async () => {
    if (databasesFetched) {
      return;
    }
    await saveOptions();
    try {
      const loadedDatabases: string[] = await getBackendSrv().post(resourcesURL + '/databases', {
        region: 'default',
        catalog: catalog || 'default',
      });
      setDatabases(loadedDatabases);
    } finally {
      setDatabasesFetched(true);
    }
  };
  // Workgroups
  const [workgroup, setWorkgroup] = useState<string | null>(jsonData.workgroup || null);
  const [workgroups, setWorkgroups] = useState<string[]>(workgroup ? [workgroup] : []);
  const [workgroupsFetched, setWorkgroupsFetched] = useState(false);
  const fetchWorkgroups = async () => {
    if (workgroupsFetched) {
      return;
    }
    await saveOptions();
    try {
      const loadedWorkgroups: string[] = await getBackendSrv().post(resourcesURL + '/workgroups', {
        region: 'default',
      });
      setWorkgroups(loadedWorkgroups);
    } finally {
      setWorkgroupsFetched(true);
    }
  };

  const onChange = (r: ResourceType) => (value: string) => {
    let newResource = {};
    switch (r) {
      case 'catalog':
        setCatalog(value);
        setDatabase(null);
        setDatabases([]);
        setDatabasesFetched(false);
        newResource = { catalog: value, database: '' };
        break;
      case 'database':
        setDatabase(value);
        newResource = { database: value };
        break;
      case 'workgroup':
        newResource = { workgroup: value };
        setWorkgroup(value);
    }
    props.onOptionsChange({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        ...newResource,
      },
    });
  };

  const onOptionsChange = (options: DataSourceSettings<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>) => {
    // clean up related state
    setSaved(false);
    setCatalogsFetched(false);
    setCatalogs([]);
    setCatalog(null);
    setDatabasesFetched(false);
    setDatabases([]);
    setDatabase(null);
    setWorkgroupsFetched(false);
    setWorkgroups([]);
    setWorkgroup(null);
    props.onOptionsChange(options);
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
        list={catalogs}
        value={catalog}
        fetch={fetchCatalogs}
        onChange={onChange('catalog')}
        {...commonProps}
      />
      <AthenaResourceSelector
        resource="database"
        list={databases}
        value={database}
        fetch={fetchDatabases}
        onChange={onChange('database')}
        {...commonProps}
      />
      <AthenaResourceSelector
        resource="workgroup"
        list={workgroups}
        value={workgroup}
        fetch={fetchWorkgroups}
        onChange={onChange('workgroup')}
        {...commonProps}
      />
    </div>
  );
}
