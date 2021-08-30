import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '@grafana/aws-sdk';
import { DataQuery, DataSourceSettings } from '@grafana/data';

export enum FormatOptions {
  TimeSeries,
  Table,
}
export interface AthenaQuery extends DataQuery {
  format: FormatOptions; 
  rawSQL: string;
  connectionArgs: {
    region: string;
    catalog: string;
  };
}

export const defaultQuery: Partial<AthenaQuery> = {
  format: FormatOptions.Table,
  rawSQL: 'select 1',
  connectionArgs: {
    region: 'default',
    catalog: 'default',
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
