---
aliases:
  - /docs/plugins/grafana-athena-datasource/query-editor/
description: Use the Amazon Athena query editor to build SQL queries in Grafana.
keywords:
  - grafana
  - amazon athena
  - athena
  - aws
  - query editor
  - sql
  - macros
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Query editor
title: Amazon Athena query editor
weight: 300
last_reviewed: 2026-02-20
---

# Amazon Athena query editor

This document explains how to use the Amazon Athena query editor to build and run SQL queries in Grafana.

## Before you begin

Before you use the query editor, ensure you have the following prerequisites.

- [Configure the Amazon Athena data source](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/configure/).
- Verify your IAM credentials have the required Athena, Glue, and S3 permissions.

## Key concepts

If you're new to Amazon Athena, the following terms are used throughout this documentation.

| Term | Description |
| ---------------- | ----------- |
| **Data catalog** | A metadata store that contains database and table definitions in Athena. |
| **Workgroup** | A resource that isolates query execution and tracks costs for groups of users. |
| **Presto** | The distributed SQL query engine that Athena is based on. Macros reference Presto's date functions. |

## Query editor fields

The query editor provides resource selectors and a SQL code editor with context-aware autocompletion.

### Resource selectors

Use the drop-down selectors at the top of the query editor to choose the query context. All selectors support template variables.

| Field | Description |
| ------------ | ----------- |
| **Region** | The AWS region to query. |
| **Catalog** | The Athena data catalog. Options load based on the selected region. |
| **Database** | The database within the selected catalog. |
| **Table** | (Optional) The table to query. The selected table is available through the `$__table` macro. |
| **Column** | (Optional) A column from the selected table. The selected column is available through the `$__column` macro. Requires a table selection. |

### Format options

Select a format for the query results.

| Format | Description |
| --------------- | ----------- |
| **Time series** | Use for time-based data in graph visualizations. Requires a date or datetime column in ascending order and at least one numeric column. |
| **Table** | Use for tabular data. Any query that returns results displays in a table. |
| **Logs** | Use for log data visualizations in Explore. |

## Write a query

The query editor provides a SQL code editor with context-aware autocompletion for table and column names. Write standard SQL queries to retrieve data from your Athena tables.

### Table visualization example

Most Amazon Athena queries are best represented by a table visualization.

```sql
SELECT column_1, column_2 FROM my_table;
```

### Time series example

For time series and graph visualizations, select a column with a `date` or `datetime` type in ascending order and at least one numeric column.

```sql
SELECT
  time,
  value
FROM my_table
WHERE $__timeFilter(time)
ORDER BY time ASC
```

## Macros

Grafana provides macros that expand to Athena-compatible SQL at query execution time. Use macros to dynamically filter data based on the dashboard's time range and other settings.

| Macro | Description | Example | Output |
| ------------------------------------ | ----------- | ------- | ------ |
| `$__dateFilter(column)` | Filters data based on the date range of the panel. | `$__dateFilter(my_date)` | `my_date BETWEEN date '2017-07-18' AND date '2017-07-18'` |
| `$__parseTime(column, format)` | Casts a varchar as a timestamp with the given format. | `$__parseTime(eventtime, 'yyyy-MM-dd''T''HH:mm:ss''Z')` | `parse_datetime(time,'yyyy-MM-dd''T''HH:mm:ss''Z')` |
| `$__timeFilter(column, format)` | Filters data based on the time range of the panel. The optional second argument parses a varchar column to a timestamp using Presto's [Java Date Functions](https://prestodb.io/docs/current/functions/datetime.html#java-date-functions). | `$__timeFilter(time)` | `time BETWEEN TIMESTAMP '2017-07-18 11:15:52' AND TIMESTAMP '2017-07-18 11:25:52'` |
| `$__timeFrom()` | Outputs the start time of the panel range as a quoted timestamp. | `$__timeFrom()` | `TIMESTAMP '2017-07-18 11:15:52'` |
| `$__timeTo()` | Outputs the end time of the panel range as a quoted timestamp. | `$__timeTo()` | `TIMESTAMP '2017-07-18 11:15:52'` |
| `$__rawTimeFrom(format)` | Outputs the start time of the panel range as a formatted string. Uses Joda's [DateTime format](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html). | `$__rawTimeFrom('yyyy-MM-dd HH:mm:ss')` | `'2022-03-24 21:19:03'` |
| `$__rawTimeTo(format)` | Outputs the end time of the panel range as a formatted string. Uses Joda's [DateTime format](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html). | `$__rawTimeTo('yyyy-MM-dd HH:mm:ss')` | `'2022-03-24 21:19:03'` |
| `$__timeGroup(column, interval, format)` | Groups timestamps into intervals so there is one data point per period on the graph. The optional third argument parses a varchar column to a timestamp. | `$__timeGroup(time, '5m', 'yyyy-MM-dd''T''HH:mm:ss.SSSSSS''Z')` | `FROM_UNIXTIME(FLOOR(TO_UNIXTIME(parse_datetime(time,'yyyy-MM-dd''T''HH:mm:ss.SSSSSS''Z'))/300)*300)` |
| `$__unixEpochFilter(column)` | Same as `$__timeFilter` but for UNIX timestamp columns. | `$__unixEpochFilter(time)` | `time BETWEEN 1637228322 AND 1637232700` |
| `$__unixEpochGroup(column, interval)` | Same as `$__timeGroup` but for UNIX timestamp columns. | `$__unixEpochGroup(time, '5m')` | `FROM_UNIXTIME(FLOOR(time/300)*300)` |
| `$__table` | Returns the table selected in the **Table** selector. | `$__table` | `my_table` |
| `$__column` | Returns the column selected in the **Column** selector. Requires a table selection. | `$__column` | `col1` |

## Inspect the query

Grafana macros aren't valid Athena SQL, so a query that uses macros won't work if copied and pasted directly into Amazon Athena. To view the fully interpolated query that works in Amazon Athena, click the **Query Inspector** button and select the **Query** tab.

## Async query data support

Async query data support enables an asynchronous query handling flow. Queries are handled over multiple requests (starting, checking status, and fetching results) instead of starting and resolving a query in a single request. This is useful for queries that run for a long time and might otherwise time out.

Async query data support is enabled by default in all Amazon Athena data sources.

### Async query caching

To enable [query caching](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/data-source-management/#query-caching) for async queries, you must meet the following requirements:

- Run Grafana version 10.1 or later.
- Set the feature toggles `useCachingService` and `awsAsyncQueryCaching` to `true`.
- [Configure query caching](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/data-source-management/#query-caching) for the Amazon Athena data source.

## Query result reuse

Query result reuse lets Amazon Athena reuse query results from previous executions, reducing cost and query time. You can enable it per query by selecting the **Enabled** checkbox in the **Query result reuse** section of the query editor. You can also configure the **Max Age in Minutes** setting (default: 60 minutes) to control how old a cached result can be.

For more information, refer to the [Amazon Athena documentation on reusing query results](https://docs.aws.amazon.com/athena/latest/ug/reusing-query-results.html).

{{< admonition type="note" >}}
Result reuse requires Amazon Athena engine version 3. For upgrade instructions, refer to [Changing Athena engine versions](https://docs.aws.amazon.com/athena/latest/ug/engine-versions-changing.html).
{{< /admonition >}}

## Next steps

- [Use template variables](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/template-variables/)
- [Add annotations](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/annotations/)
