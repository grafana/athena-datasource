import type { DataSourceSettings } from '@grafana/data';
import type { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '@grafana/aws-sdk';

export type AthenaDataSourceOptions = AwsAuthDataSourceJsonData & {
    catalog?: string;
    database?: string;
    workgroup?: string;
    outputLocation?: string;
}

export type AthenaDataSourceSecureJsonData = AwsAuthDataSourceSecureJsonData;

export type AthenaDataSourceSettings = DataSourceSettings<AthenaDataSourceOptions, AthenaDataSourceSecureJsonData>;
