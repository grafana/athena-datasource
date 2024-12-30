import { MacroType } from '@grafana/plugin-ui';

const COLUMN = 'column',
  RELATIVE_TIME_STRING = "'1m'",
  TIMESTAMP_FORMAT = "'yyyy-MM-dd HH:mm:ss'";

export const TABLE_MACRO = '$__table';

export const MACROS = [
  {
    id: '$__dateFilter(dateColumn)',
    name: '$__dateFilter(dateColumn)',
    text: '$__dateFilter',
    args: [COLUMN],
    type: MacroType.Filter,
    description:
      "Will be replaced by a date range filter using the specified column name. For example, time BETWEEN date '2017-07-18' AND date '2017-07-18'",
  },
  {
    id: '$__timeFilter(timeColumn)',
    name: '$__timeFilter(timeColumn)',
    text: '$__timeFilter',
    args: [COLUMN],
    type: MacroType.Filter,
    description:
      "Will be replaced by a time range filter using the specified column name. For example, time BETWEEN TIMESTAMP '2017-07-18 11:15:52' AND TIMESTAMP '2017-07-18 11:25:52'",
  },
  {
    id: '$__timeFilter(timeColumn, timeFormat)',
    name: '$__timeFilter(timeColumn, timeFormat)',
    text: '$__timeFilter',
    args: [COLUMN, TIMESTAMP_FORMAT],
    type: MacroType.Filter,
    description:
      "Will be replaced by a time range filter using the specified column name and the specified time format. For example, time parse_datetime(time,'yyyy-MM-dd''T''HH:mm:ss''+0000') BETWEEN TIMESTAMP '2017-07-18 11:15:52' AND TIMESTAMP '2017-07-18 11:25:52'",
  },
  {
    id: '$__timeFrom()',
    name: '$__timeFrom()',
    text: '$__timeFrom',
    args: [],
    type: MacroType.Filter,
    description:
      "Will be replaced by the start of the currently active time selection. For example, TIMESTAMP '2017-07-18 11:15:52'",
  },
  {
    id: '$__rawTimeFrom',
    name: '$__rawTimeFrom',
    text: '$__rawTimeFrom',
    args: [],
    type: MacroType.Filter,
    description: 'Will return the current starting time of the time range',
  },
  {
    id: '$__rawTimeFrom(FORMAT)',
    name: '$__rawTimeFrom(FORMAT)',
    text: '$__rawTimeFrom(FORMAT)',
    args: [TIMESTAMP_FORMAT],
    type: MacroType.Filter,
    description: 'Will return the current starting time of the time range. Use second argument to specify time format.',
  },
  {
    id: '$__timeTo()',
    name: '$__timeTo()',
    text: '$__timeTo',
    args: [],
    type: MacroType.Filter,
    description:
      "Will be replaced by the end of the currently active time selection. For example, '2017-07-18T11:15:52Z'",
  },
  {
    id: '$__rawTimeTo',
    name: '$__rawTimeTo',
    text: '$__rawTimeTo',
    args: [],
    type: MacroType.Filter,
    description: 'Will return the current ending time of the time range',
  },
  {
    id: '$__rawTimeTo(FORMAT)',
    name: '$__rawTimeTo(FORMAT)',
    text: '$__rawTimeTo(FORMAT)',
    args: [TIMESTAMP_FORMAT],
    type: MacroType.Filter,
    description: 'Will return the current ending time of the time range. Use second argument to specify time format.',
  },
  {
    id: '$__unixEpochFilter()',
    name: '$__unixEpochFilter()',
    text: '$__unixEpochFilter',
    args: [COLUMN],
    type: MacroType.Filter,
    description:
      'Will be replaced by a time range filter using the specified column name with times represented as Unix timestamp. For example, column >= 1624406400 AND column <= 1624410000',
  },
  {
    id: "$__timeGroup(dateColumn, '1m')",
    name: "$__timeGroup(dateColumn, '1m')",
    text: "$__timeGroup(dateColumn, '1m')",
    args: [COLUMN, RELATIVE_TIME_STRING],
    type: MacroType.Group,
    description: `Will be replace by an expression that will group timestamps so that there is only 1 point for every period on the graph. For example, 'floor(extract(epoch from time)/60)*60 AS "time"'`,
  },
  {
    id: "$__timeGroup(dateColumn, '1m', FORMAT)",
    name: "$__timeGroup(dateColumn, '1m', FORMAT)",
    text: '$__timeGroup',
    args: [COLUMN, RELATIVE_TIME_STRING, TIMESTAMP_FORMAT],
    type: MacroType.Group,
    description: `Will be replace by an expression that will group timestamps so that there is only 1 point for every period on the graph. The third argument is used to optionally parse the column from a varchar to a timestamp with a specific format. For example, FROM_UNIXTIME(FLOOR(TO_UNIXTIME(parse_datetime(time,'yyyy-MM-dd''T''HH:mm:ss.SSSSSS''Z'))/300)*300)`,
  },
  {
    id: "$__unixEpochGroup(dateColumn, '1m')",
    name: "$__unixEpochGroup(dateColumn, '1m')",
    text: "$__unixEpochGroup(dateColumn, '1m')",
    args: [COLUMN, RELATIVE_TIME_STRING],
    type: MacroType.Group,
    description: `Will be replace by an expression that will group epoch timestamps so that there is only 1 point for every period on the graph. For example, 'floor(time/60)*60 AS "time"'`,
  },
  {
    id: '$__column',
    name: '$__column',
    text: '$__column',
    args: [],
    type: MacroType.Column,
    description: 'Will be replaced by the query column.',
  },
  {
    id: TABLE_MACRO,
    name: TABLE_MACRO,
    text: TABLE_MACRO,
    args: [],
    type: MacroType.Table,
    description: 'Will be replaced by the query table.',
  },
  {
    id: '$__parseTime',
    name: '$__parseTime',
    text: '$__parseTime',
    args: [COLUMN, TIMESTAMP_FORMAT],
    type: MacroType.Value,
    description: 'Will cast a varchar as a timestamp using the provided format.',
  },
];
