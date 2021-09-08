import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '@grafana/aws-sdk';
import { DataQuery, DataSourceSettings, SelectableValue } from '@grafana/data';

export enum FormatOptions {
  TimeSeries,
  Table,
  Logs,
}

export const SelectableFormatOptions: Array<SelectableValue<FormatOptions>> = [
  {
    label: 'Time Series',
    value: FormatOptions.TimeSeries,
  },
  {
    label: 'Table',
    value: FormatOptions.Table,
  },
  {
    label: 'Logs',
    value: FormatOptions.Logs,
  },
];

export interface AthenaQuery extends DataQuery {
  format: FormatOptions;
  rawSQL: string;
  connectionArgs: {
    region: string;
    catalog: string;
    database: string;
  };
}

export const defaultKey = '__default';

export const defaultQuery: Partial<AthenaQuery> = {
  format: FormatOptions.Table,
  rawSQL: 'select 1',
  connectionArgs: {
    region: defaultKey,
    catalog: defaultKey,
    database: defaultKey,
  },
};

/**
 * These are options configured for each DataSource instance
 */
export interface AthenaDataSourceOptions extends AwsAuthDataSourceJsonData {
  catalog?: string;
  database?: string;
  workgroup?: string;
}

/**
 * Values that are used in the backend, but never sent over HTTP to the frontend
 */
export interface AthenaDataSourceSecureJsonData extends AwsAuthDataSourceSecureJsonData {}

export type AthenaDataSourceSettings = DataSourceSettings<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;
