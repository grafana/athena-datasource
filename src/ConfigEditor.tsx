import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps, onUpdateDatasourceJsonDataOption } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from './types';
import { ConnectionConfig } from '@grafana/aws-sdk';
import { InlineField, Input } from '@grafana/ui';
import { selectors } from './tests/selectors';

type Props = DataSourcePluginOptionsEditorProps<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  render() {
    return (
      <div className="gf-form-group">
        <ConnectionConfig {...this.props} />
        <InlineField label="Catalog (datasource)" labelWidth={28}>
          <Input
            data-testId={selectors.components.ConfigEditor.Catalog.input}
            css
            className="width-30"
            value={this.props.options.jsonData.catalog}
            onChange={onUpdateDatasourceJsonDataOption(this.props, 'catalog')}
          />
        </InlineField>
        <InlineField label="Database" labelWidth={28}>
          <Input
            data-testId={selectors.components.ConfigEditor.Database.input}
            css
            className="width-30"
            value={this.props.options.jsonData.database}
            onChange={onUpdateDatasourceJsonDataOption(this.props, 'database')}
          />
        </InlineField>
        <InlineField label="Workgroup" labelWidth={28}>
          <Input
            data-testId={selectors.components.ConfigEditor.Workgroup.input}
            css
            className="width-30"
            value={this.props.options.jsonData.workgroup}
            onChange={onUpdateDatasourceJsonDataOption(this.props, 'workgroup')}
          />
        </InlineField>
      </div>
    );
  }
}
