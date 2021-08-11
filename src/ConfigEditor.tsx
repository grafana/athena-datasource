import React from 'react';
import { DataSourcePluginOptionsEditorProps, onUpdateDatasourceJsonDataOption } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from './types';
import { ConnectionConfig } from '@grafana/aws-sdk';
import { InlineField, Input } from '@grafana/ui';
import { selectors } from './tests/selectors';

type Props = DataSourcePluginOptionsEditorProps<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;

export function ConfigEditor(props: Props) {
  return (
    <div className="gf-form-group">
      <ConnectionConfig {...props} />
      <InlineField label="Catalog (datasource)" labelWidth={28}>
        <Input
          data-testId={selectors.components.ConfigEditor.Catalog.input}
          css
          className="width-30"
          value={props.options.jsonData.catalog}
          onChange={onUpdateDatasourceJsonDataOption(props, 'catalog')}
        />
      </InlineField>
      <InlineField label="Database" labelWidth={28}>
        <Input
          data-testId={selectors.components.ConfigEditor.Database.input}
          css
          className="width-30"
          value={props.options.jsonData.database}
          onChange={onUpdateDatasourceJsonDataOption(props, 'database')}
        />
      </InlineField>
      <InlineField label="Workgroup" labelWidth={28}>
        <Input
          data-testId={selectors.components.ConfigEditor.Workgroup.input}
          css
          className="width-30"
          value={props.options.jsonData.workgroup}
          onChange={onUpdateDatasourceJsonDataOption(props, 'workgroup')}
        />
      </InlineField>
    </div>
  );
}
