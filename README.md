## Grafana 10 breaking change: update Athena datasource plugin to >=2.9.3

Grafana 10.0.0 was shipped with the new React 18 upgrade. Changes in batching of state updates in React 18 cause a bug in the query editor in Athena versions <=2.9.2. If you’re using Grafana@>=10.0.0, please update your plugin to version 2.9.3 or higher in your Grafana instance management console.

# Athena data source for Grafana

The Athena data source plugin allows you to query and visualize Athena data metrics from within Grafana.

This topic explains options, variables, querying, and other options specific to this data source. Refer to [Add a data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/) for instructions on how to add a data source to Grafana.

## Configure the data source in Grafana

To access data source settings:

1. Hover your mouse over the **Configuration** (gear) icon.
1. Click **Data sources**, and then click the AWS Athena data source.

| Name                         | Description                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`                       | The data source name. This is how you refer to the data source in panels and queries.                                                                                                                                                                                                                                                                                             |
| `Default`                    | Default data source means that it will be pre-selected for new panels.                                                                                                                                                                                                                                                                                                            |
| `Auth Provider`              | Specify the provider to get credentials.                                                                                                                                                                                                                                                                                                                                          |
| `Access Key ID`              | If `Access & secret key` is selected, specify the Access Key of the security credentials to use.                                                                                                                                                                                                                                                                                  |
| `Secret Access Key`          | If `Access & secret key` is selected, specify the Secret Key of the security credentials to use.                                                                                                                                                                                                                                                                                  |
| `Credentials Profile Name`   | Specify the name of the profile to use (if you use `~/.aws/credentials` file), leave blank for default.                                                                                                                                                                                                                                                                           |
| `Assume Role Arn` (optional) | Specify the ARN of the role to assume.                                                                                                                                                                                                                                                                                                                                            |
| `External ID` (optional)     | If you are assuming a role in another account, that has been created with an external ID, specify the external ID here.                                                                                                                                                                                                                                                           |
| `Endpoint` (optional)        | Optionally, specify a custom endpoint for the service.                                                                                                                                                                                                                                                                                                                            |
| `Default Region`             | Region in which the cluster is deployed.                                                                                                                                                                                                                                                                                                                                          |
| `Catalog (datasource)`       | Athena catalog. The list of catalogs will be retrieved automatically.                                                                                                                                                                                                                                                                                                             |
| `Database`                   | Name of the database within the catalog.                                                                                                                                                                                                                                                                                                                                          |
| `Workgroup`                  | Workgroup to use.                                                                                                                                                                                                                                                                                                                                                                 |
| `Output Location`            | AWS S3 bucket to store execution outputs. If not specified, the default query result location from the Workgroup configuration will be used. Please note that if [`Override client-side settings`](https://docs.aws.amazon.com/athena/latest/ug/workgroups-settings-override.html?icmpid=docs_console_unmapped) is enabled in the AWS console, `Output Location` will be ignored. |

## Authentication

For authentication options and configuration details, see [AWS authentication](https://grafana.com/docs/grafana/next/datasources/aws-cloudwatch/aws-authentication/) topic.

### IAM policies

Grafana needs permissions granted via IAM to be able to read Athena metrics. You can attach these permissions to IAM roles and utilize Grafana's built-in support for assuming roles. Note that you will need to [configure the required policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html) before adding the data source to Grafana.

Depending on the source of the data you'd query with Athena, you may need different permissions. AWS provides some predefined policies that you can check [here](https://docs.aws.amazon.com/athena/latest/ug/managed-policies.html).

This is an example of a minimal policy you can use to query Athena. It is based on the [`AmazonAthenaFullAccess`](https://docs.aws.amazon.com/athena/latest/ug/managed-policies.html#amazonathenafullaccess-managed-policy) policy, without write permissions when possible, since Grafana should be used as read-only:

> **NOTE**: Update the ARN of the S3 bucket if you are using a custom one.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AthenaQueryAccess",
      "Effect": "Allow",
      "Action": [
        "athena:ListDatabases",
        "athena:ListDataCatalogs",
        "athena:ListWorkGroups",
        "athena:GetDatabase",
        "athena:GetDataCatalog",
        "athena:GetQueryExecution",
        "athena:GetQueryResults",
        "athena:GetTableMetadata",
        "athena:GetWorkGroup",
        "athena:ListTableMetadata",
        "athena:StartQueryExecution",
        "athena:StopQueryExecution"
      ],
      "Resource": ["*"]
    },
    {
      "Sid": "GlueReadAccess",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetPartition",
        "glue:GetPartitions",
        "glue:BatchGetPartition"
      ],
      "Resource": ["*"]
    },
    {
      "Sid": "AthenaS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload",
        "s3:PutObject"
      ],
      "Resource": ["arn:aws:s3:::aws-athena-query-results-*"]
    },
    {
      "Sid": "AthenaExamplesS3Access",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::athena-examples*"]
    }
  ]
}
```

## Query Athena data

The provided query editor is a standard SQL query editor. Grafana includes some macros to help with writing more complex timeseries queries.

#### Macros

| Macro                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Example                                                                                                                                                                                                                                                                                                                            | Output example                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(column)`              | `$__dateFilter` creates a conditional that filters the data (using `column`) based on the date range of the panel.                                                                                                                                                                                                                                                                                                                                                       | `$__dateFilter(my_date)`                                                                                                                                                                                                                                                                                                           | `my_date BETWEEN date '2017-07-18' AND date '2017-07-18'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `$__parseTime(column,format)`        | `$__parseTime` cast a varchar as a timestamp with the given format.                                                                                                                                                                                                                                                                                                                                                                                                      | `$__parseTime(eventtime, 'yyyy-MM-dd''T''HH:mm:ss''Z')`                                                                                                                                                                                                                                                                            | `parse_datetime(time,'yyyy-MM-dd''T''HH:mm:ss''Z')`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `$__timeFilter(column,format)`       | `$__timeFilter` creates a conditional that filters the data (using `column`) based on the time range of the panel. The second argument is used to optionally parse the column from a varchar to a timestamp with a specific format. Keep in mind that this macro uses Presto's [Java Date Functions](https://prestodb.io/docs/current/functions/datetime.html#java-date-functions) `parse_datetime(string, format)` when a custom format is passed as `format` argument. | 1. Without specifying a format: `$__timeFilter(time)` <br /><br />2. Using the [default format](https://github.com/grafana/athena-datasource/tree/v1.0.3/pkg/athena/macros.go#L14): `$__timeFilter(time, 'yyyy-MM-dd HH:mm:ss')`<br /><br />3. With another custom format: `$__timeFilter(time, 'yyyy-MM-dd''T''HH:mm:ss''+0000')` | 1. Without specifying a format: `time BETWEEN TIMESTAMP '2017-07-18 11:15:52' AND TIMESTAMP '2017-07-18 11:25:52'`<br /><br />2. Using the [default format](https://github.com/grafana/athena-datasource/tree/v1.0.3/pkg/athena/macros.go#L14): `TIMESTAMP time BETWEEN TIMESTAMP '2017-07-18T11:15:52Z' AND TIMESTAMP '2017-07-18T11:15:52Z'`<br /><br />3. With another custom format: `parse_datetime(time,'yyyy-MM-dd''T''HH:mm:ss''+0000') BETWEEN TIMESTAMP '2017-07-18 11:15:52' AND TIMESTAMP '2017-07-18 11:25:52'` |
| `$__timeFrom()`                      | `$__timeFrom` outputs the current starting time of the range of the panel with quotes.                                                                                                                                                                                                                                                                                                                                                                                   | `$__timeFrom()`                                                                                                                                                                                                                                                                                                                    | `TIMESTAMP '2017-07-18 11:15:52'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `$__rawTimeFrom()`                   | `$__rawTimeFrom` outputs the current starting time of the range of the panel formatted as a string. An optional argument is used to specify the output format of the string using Joda's [DateTime format](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html).                                                                                                                                                                           | 1. Without specifying a format: `$__rawTimeFrom()` <br /><br />2. Using the [default format](https://github.com/grafana/athena-datasource/tree/v1.0.3/pkg/athena/macros.go#L14): `$__rawTimeFrom('yyyy-MM-dd HH:mm:ss')`<br /><br />3. With a custom format: `$__rawTimeFrom('yyyy/MM/dd/HH)`                                      | 1. Without specifying a format: `'2022-03-24 21:19:03'`<br /><br />2. Using the [default format](https://github.com/grafana/athena-datasource/tree/v1.0.3/pkg/athena/macros.go#L14): `'2022-03-24 21:19:03'`<br /><br />3. With another custom format: `'2022/03/24/21'`                                                                                                                                                                                                                                                     |
| `$__timeTo()`                        | `$__timeTo` outputs the current ending time of the range of the panel with quotes.                                                                                                                                                                                                                                                                                                                                                                                       | `$__timeTo()`                                                                                                                                                                                                                                                                                                                      | `TIMESTAMP '2017-07-18 11:15:52'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `$__rawTimeTo()`                     | `$__rawTimeTo` outputs the current ending time of the range of the panel formatted as a string. An optional argument is used to specify the output format of the string using Joda's [DateTime format](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html).                                                                                                                                                                               | 1. Without specifying a format: `$__rawTimeTo()` <br /><br />2. Using the [default format](https://github.com/grafana/athena-datasource/tree/v1.0.3/pkg/athena/macros.go#L14): `$__rawTimeTo('yyyy-MM-dd HH:mm:ss')`<br /><br />3. With a custom format: `$__rawTimeTo('yyyy/MM/dd/HH)`                                            | 1. Without specifying a format: `'2022-03-24 21:19:03'`<br /><br />2. Using the [default format](https://github.com/grafana/athena-datasource/tree/v1.0.3/pkg/athena/macros.go#L14): `'2022-03-24 21:19:03'`<br /><br />3. With another custom format: `'2022/03/24/21'`                                                                                                                                                                                                                                                     |
| `$__timeGroup(column, '1m', format)` | `$__timeGroup` groups timestamps so that there is only 1 point for every period on the graph. The third argument is used to optionally parse the column from a varchar to a timestamp with a specific format.                                                                                                                                                                                                                                                            | `$__timeGroup(time,'5m','yyyy-MM-dd''T''HH:mm:ss.SSSSSS''Z')`                                                                                                                                                                                                                                                                      | `FROM_UNIXTIME(FLOOR(TO_UNIXTIME(parse_datetime(time,'yyyy-MM-dd''T''HH:mm:ss.SSSSSS''Z'))/300)*300)`                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `$__unixEpochFilter(column)`         | `$__unixEpochFilter` achieves the same than `$__timeFilter` but when the time is a UNIX timestamp.                                                                                                                                                                                                                                                                                                                                                                       | `$__unixEpochFilter(time)`                                                                                                                                                                                                                                                                                                         | `time BETWEEN 1637228322 AND 1637232700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `$__unixEpochGroup(column, '1m')`    | `$__unixEpochGroup` achieves the same than `$__timeGroup` but when the time is a UNIX timestamp.                                                                                                                                                                                                                                                                                                                                                                         | `$__unixEpochGroup(time, '5m')`                                                                                                                                                                                                                                                                                                    | `FROM_UNIXTIME(FLOOR(time/300)*300)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `$__table`                           | `$__table` returns the table selected in the Table selector                                                                                                                                                                                                                                                                                                                                                                                                              | `$__table`                                                                                                                                                                                                                                                                                                                         | `my_table`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `$__column`                          | `$__column` returns the column selected in the Column selector (it requires a table)                                                                                                                                                                                                                                                                                                                                                                                     | `$__column`                                                                                                                                                                                                                                                                                                                        | `col1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

#### Table Visualization

Most queries in Athena will be best represented by a table visualization. Any query will display data in a table. Any query that returns results will display data in a table..

This example returns results for a table visualization:

```sql
SELECT {column_1}, {column_2} FROM {table};
```

#### Timeseries and Graph visualizations

Time series ad graph visualizations, you must:

- Select a column with a `date` or `datetime` type. The `date` column must be in ascending order (using `ORDER BY column ASC`).
- Also select a numeric column.

#### Inspecting the query

Grafana supports macros that Athena does not, which means a query might not work when copied and pasted directly into Athena. To view the full interpolated query, which works directly in Athena, click the **Query Inspector** button. The full query is displayed under the **Query** tab.

### Templates and variables

To add a new Athena query variable, refer to [Add a query variable](https://grafana.com/docs/grafana/latest/variables/variable-types/add-query-variable/).

Any value queried from an Athena table can be used as a variable.

After creating a variable, you can use it in your Athena queries by using [Variable syntax](https://grafana.com/docs/grafana/latest/variables/syntax/). For more information about variables, refer to [Templates and variables](https://grafana.com/docs/grafana/latest/variables/).

### Annotations

[Annotations](https://grafana.com/docs/grafana/latest/dashboards/annotations/) allow you to overlay rich event information on top of graphs. You can add annotations by clicking on panels or by adding annotation queries via the Dashboard menu / Annotations view.

**Example query to automatically add annotations:**

```sql
SELECT
  time as time,
  environment as tags,
  humidity as text
FROM
  tableName
WHERE
  $__dateFilter(time) and humidity > 95
```

The following table represents the values of the columns taken into account to render annotations:

| Name      | Description                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `time`    | The name of the date/time field. Could be a column with a native SQL date/time data type or epoch value.                          |
| `timeend` | Optional name of the end date/time field. Could be a column with a native SQL date/time data type or epoch value. (Grafana v6.6+) |
| `text`    | Event description field.                                                                                                          |
| `tags`    | Optional field name to use for event tags as a comma separated string.                                                            |

## Provision Athena data source

You can configure the Athena data source using configuration files with Grafana's provisioning system or using Grafana's [Datasource JSON API](https://grafana.com/docs/grafana/latest/http_api/data_source/#create-a-data-source)
. For more information, refer to the [provisioning docs page](https://grafana.com/docs/grafana/latest/administration/provisioning/).

Here are some provisioning examples.

### Using AWS SDK (default)

```yaml
apiVersion: 1
datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: default
      defaultRegion: eu-west-2
      catalog: AwsDataCatalog
      database: '<your athena database>'
      workgroup: '<your athena workgroup>'
```

### Using credentials' profile name (non-default)

```yaml
apiVersion: 1

datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: credentials
      defaultRegion: eu-west-2
      profile: secondary
      catalog: AwsDataCatalog
      database: '<your athena database>'
      workgroup: '<your athena workgroup>'
```

### Using `accessKey` and `secretKey`

```yaml
apiVersion: 1

datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: keys
      defaultRegion: eu-west-2
    secureJsonData:
      accessKey: '<your access key>'
      secretKey: '<your secret key>'
      catalog: AwsDataCatalog
      database: '<your athena database>'
      workgroup: '<your athena workgroup>'
```

### Using AWS SDK Default and ARN of IAM Role to Assume

```yaml
apiVersion: 1
datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: default
      assumeRoleArn: arn:aws:iam::123456789012:root
      defaultRegion: eu-west-2
      catalog: AwsDataCatalog
      database: '<your athena database>'
      workgroup: '<your athena workgroup>'
```

There are also some optional parameters to configure this datasource:

```yaml
jsonData:
  endpoint: https://'{service}.{region}.amazonaws.com'
  externalId: '<your role external id>'
  outputLocation: s3://'<your s3 bucket>'
```

### Acknowledgment

The backend driver is based on the implementation of [uber/athenadriver](https://github.com/uber/athenadriver), which provides a fully-featured driver for AWS Athena.

## Get the most out of the plugin

- Add [Annotations](https://grafana.com/docs/grafana/latest/dashboards/annotations/).
- Configure and use [Templates and variables](https://grafana.com/docs/grafana/latest/variables/).
- Add [Transformations](https://grafana.com/docs/grafana/latest/panels/transformations/).
- Set up alerting; refer to [Alerts overview](https://grafana.com/docs/grafana/latest/alerting/).

## Async Query Data Support

Async query data support enables an asynchronous query handling flow. With async query data support enabled, queries are handled over multiple requests (starting, checking its status, and fetching the results) instead of starting and resolving a query over a single request. This is useful for queries that can potentially run for a long time and timeout.

To enable async query data support, you need to set feature toggle `athenaAsyncQueryDataSupport` to `true`. See [Configure feature toggles](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#feature_toggles) for details.

### Async Query Caching

To enable [query caching](https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-caching) for async queries, you need to be on Grafana version 10.1 or above, and to set the feature toggles `useCachingService` and `awsAsyncQueryCaching` to `true`. You'll also need to [configure query caching](https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-caching) for the specific Athena datasource.

## Query Result Reuse

Query result reuse is a feature that allows Athena to reuse query results from previous queries. You can enable it per query by selecting the `Enabled` checkbox under the `Query result reuse` section in the query editor. Learn more in the [AWS Athena documentation](https://docs.aws.amazon.com/athena/latest/ug/reusing-query-results.html).

Note: Result reuse requires Athena to be on engine version 3. AWS provides instructions for [Changing Athena engine versions](https://docs.aws.amazon.com/athena/latest/ug/engine-versions-changing.html).
