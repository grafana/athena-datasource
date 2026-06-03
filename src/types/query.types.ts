import { SelectableValue } from '@grafana/data'
import { SQLQuery } from '@grafana/aws-sdk';


export enum FormatOptions {
    TimeSeries,
    Table,
    Logs,
}

export enum QueryEditorFieldType {
    Regions = 'regions',
    Catalogs = 'catalogs',
    Databases = 'databases',
    Tables = 'tables',
    Columns = 'columns',
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

export interface AthenaQuery extends SQLQuery {
    format: FormatOptions;
    connectionArgs: {
        region?: string;
        catalog?: string;
        database?: string;
        resultReuseEnabled?: boolean;
        resultReuseMaxAgeInMinutes?: number;
    };
    table?: string;
    column?: string;

    queryID?: string;
}

export const defaultKey = '__default';

export const DEFAULT_RESULT_REUSE_ENABLED = false;
export const DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES = 60;

export const defaultQuery: Partial<AthenaQuery> = {
    format: FormatOptions.Table,
    rawSQL: '',
    connectionArgs: {
        region: defaultKey,
        catalog: defaultKey,
        database: defaultKey,
        resultReuseEnabled: DEFAULT_RESULT_REUSE_ENABLED,
        resultReuseMaxAgeInMinutes: DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES,
    },
};
