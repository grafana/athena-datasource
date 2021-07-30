import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { AthenaDataSourceOptions, AthenaDataSourceSecureJsonData } from './types';
import { ConnectionConfig } from '@grafana/aws-sdk';

type Props = DataSourcePluginOptionsEditorProps<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  render() {
    return (
      <div className="gf-form-group">
        <ConnectionConfig {...this.props} />
      </div>
    );
  }
}
