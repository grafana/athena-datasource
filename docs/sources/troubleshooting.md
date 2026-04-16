---
aliases:
  - /docs/plugins/grafana-athena-datasource/troubleshooting/
description: Troubleshoot common issues with the Amazon Athena data source in Grafana.
keywords:
  - grafana
  - amazon athena
  - athena
  - aws
  - troubleshooting
  - errors
  - authentication
  - query
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Troubleshooting
title: Troubleshoot Amazon Athena data source issues
weight: 500
last_reviewed: 2026-02-20
---

# Troubleshoot Amazon Athena data source issues

This document provides solutions to common issues you may encounter when configuring or using the Amazon Athena data source. For configuration instructions, refer to [Configure the Amazon Athena data source](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/configure/).

## Authentication errors

These errors occur when AWS credentials are invalid, missing, or don't have the required permissions.

### "Access denied" or "Authorization failed"

**Symptoms:**

- **Save & test** fails with authorization errors.
- Queries return access denied messages.
- Resource drop-downs (catalogs, databases, tables) don't load.

**Possible causes and solutions:**

| Cause | Solution |
| ----- | -------- |
| Missing IAM permissions | Verify the IAM user or role has all required Athena, Glue, and S3 permissions. Refer to the [IAM policies](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/configure/#iam-policies) section for a minimal policy example. |
| Invalid access keys | Verify the access key and secret key in the data source configuration. Regenerate them in the [AWS IAM console](https://console.aws.amazon.com/iam/) if necessary. |
| Expired credentials | Create new credentials and update the data source configuration. |
| Wrong region | Verify the **Default Region** setting matches the region where your Athena resources are located. |
| Assume role misconfiguration | Verify the **Assume Role ARN** is correct and that the trust policy on the target role allows the source identity to assume it. |
| External ID mismatch | If the target role requires an external ID, verify the **External ID** field matches the value configured in the role's trust policy. |
| Lake Formation permissions | If your data is managed by AWS Lake Formation, add `lakeformation:GetDataAccess` to your IAM policy. Refer to [Access denied with AWS Lake Formation](#access-denied-with-aws-lake-formation). |

### Access denied with AWS Lake Formation

**Symptoms:**

- **Save & test** succeeds but queries return access denied errors.
- Queries fail despite having valid Athena, Glue, and S3 permissions.
- Errors occur only for tables managed by AWS Lake Formation.

**Solutions:**

1. Add the `lakeformation:GetDataAccess` permission to the IAM policy used by the data source. Refer to the [IAM policies](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/configure/#iam-policies) section for the full policy example.
1. Verify the IAM identity is registered as a data lake administrator or has been granted table-level permissions in Lake Formation. Refer to the [AWS Lake Formation permissions for Athena](https://docs.aws.amazon.com/athena/latest/ug/lf-athena.html) documentation.

### Invalid token errors in private clouds

**Symptoms:**

- Authentication fails with invalid token errors.
- Occurs when using AWS GovCloud or other private cloud partitions.

**Solutions:**

1. Ensure you're using the correct endpoint for your private cloud partition.
1. Set a custom **Endpoint** in the data source configuration that matches your private cloud.
1. Verify the region is set to the correct GovCloud or private partition region.

## Connection errors

These errors occur when Grafana can't reach the Amazon Athena service endpoints.

### "Failed to create HTTP client" or connection timeout

**Symptoms:**

- **Save & test** fails with connection errors.
- Queries time out.
- Drop-downs fail to load.

**Solutions:**

1. Verify network connectivity from the Grafana server to AWS endpoints.
1. Check that firewall rules allow outbound HTTPS (port 443) to AWS service endpoints.
1. If you're using a custom **Endpoint**, verify the URL is correct and reachable.
1. For Grafana Cloud accessing private resources, configure [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/).

## Query errors

These errors occur when executing queries against Amazon Athena.

### "No data" or empty results

**Symptoms:**

- The query executes without error but returns no data.
- Charts display a "No data" message.

**Possible causes and solutions:**

| Cause | Solution |
| ----- | -------- |
| Time range doesn't contain data | Expand the dashboard time range or verify data exists for the selected period in Amazon Athena. |
| Wrong database or table selected | Verify the correct catalog, database, and table are selected in the resource selectors. |
| Permissions issue | Verify the IAM identity has read access to the S3 location where the table data is stored. |
| Missing Glue permissions | Athena uses AWS Glue for metadata. Verify Glue permissions are included in your IAM policy. |

### Query timeout

**Symptoms:**

- The query runs for a long time then fails.
- Error mentions timeout or query limits.

**Solutions:**

1. Narrow the dashboard time range to reduce the volume of data scanned.
1. Add filters to your query to reduce the result set.
1. Use partitioned tables to limit the amount of data Athena scans.
1. Break complex queries into smaller parts.
1. Verify that [async query data support](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/query-editor/#async-query-data-support) is enabled (it is by default), which prevents long-running queries from timing out.

### Macro errors

**Symptoms:**

- Query fails with errors referencing macros like `$__timeFilter`, `$__timeGroup`, or `$__dateFilter`.
- Error messages such as "macro $__timeGroup needs time column and interval" or "expected at least one argument".

**Possible causes and solutions:**

| Cause | Solution |
| ----- | -------- |
| Missing required arguments | `$__timeGroup` requires at least a time column and interval (for example, `$__timeGroup(time, '5m')`). `$__timeFilter` and `$__dateFilter` require a column argument. |
| Invalid interval format | Verify the interval argument uses a valid format such as `'1m'`, `'5m'`, `'1h'`, or `'1d'`. |
| Incorrect date format string | When using a custom format with `$__timeFilter`, ensure the format string follows Presto's [Java Date Functions](https://prestodb.io/docs/current/functions/datetime.html#java-date-functions) syntax. |

### "Unknown column type"

**Symptoms:**

- Query fails with an error referencing an unsupported column type.

**Solutions:**

1. Check the column types in your Athena table and ensure they're supported.
1. Use a `CAST` expression to convert the column to a supported type, such as `CAST(my_column AS VARCHAR)`.

### Query doesn't work when pasted into Amazon Athena

**Symptoms:**

- A query works in Grafana but fails when copied directly into the Amazon Athena console.

**Solutions:**

1. Grafana macros (like `$__timeFilter`) aren't valid Athena SQL. Use the **Query Inspector** to view the fully interpolated query. Click the **Query Inspector** button and select the **Query** tab to copy the expanded SQL.

## Template variable errors

These errors occur when using template variables with the Amazon Athena data source.

### Variables return no values

**Solutions:**

1. Verify the data source connection is working by running **Save & test** in the data source settings.
1. Check that parent variables (for cascading variables) have valid selections.
1. Verify the IAM identity has permissions to query the tables referenced in the variable query.
1. Ensure the variable query returns results. Test the query directly in the query editor first.

### Variables are slow to load

**Solutions:**

1. Set variable refresh to **On dashboard load** instead of **On time range change** to reduce how often variables re-query.
1. Simplify variable queries, for example, by using `SELECT DISTINCT column FROM table LIMIT 100` to cap results.

## Query result reuse errors

These errors relate to the query result reuse feature.

### Result reuse isn't working

**Symptoms:**

- Queries execute fresh each time despite enabling result reuse.

**Possible causes and solutions:**

| Cause | Solution |
| ----- | -------- |
| Wrong Athena engine version | Result reuse requires Amazon Athena engine version 3. Refer to [Changing Athena engine versions](https://docs.aws.amazon.com/athena/latest/ug/engine-versions-changing.html) for upgrade instructions. |
| Feature not enabled per query | Enable the **Enabled** checkbox in the **Query result reuse** section of the query editor for each query that should reuse results. |
| Max age too short | Increase the **Max Age in Minutes** setting (default: 60 minutes) if cached results expire before they can be reused. |

## Performance issues

These issues relate to slow queries or API limits.

### API throttling

**Symptoms:**

- Intermittent errors across multiple panels.
- Dashboard panels occasionally fail to load.

**Solutions:**

1. Reduce the frequency of dashboard auto-refresh.
1. Reduce the number of panels querying Athena on a single dashboard.
1. Enable [query caching](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/data-source-management/#query-caching) to reduce the number of API calls (available in Grafana Enterprise and Grafana Cloud).
1. Request a [service quota increase](https://docs.aws.amazon.com/athena/latest/ug/service-limits.html) from AWS if you consistently hit API rate limits.

## Enable debug logging

To capture detailed error information for troubleshooting:

1. Set the Grafana log level to `debug` in the configuration file:

   ```ini
   [log]
   level = debug
   ```

1. Review logs in `/var/log/grafana/grafana.log` (or your configured log location).
1. Look for entries related to `grafana-athena-datasource` that include request and response details.
1. Reset the log level to `info` after troubleshooting to avoid excessive log volume.

## Get additional help

If you've tried the solutions in this document and still encounter issues:

1. Check the [Grafana community forums](https://community.grafana.com/) for similar issues.
1. Review the [Athena data source plugin GitHub issues](https://github.com/grafana/athena-datasource/issues) for known bugs.
1. Refer to the [Amazon Athena documentation](https://docs.aws.amazon.com/athena/latest/ug/what-is.html) for service-specific guidance.
1. Contact Grafana Support if you're a Grafana Cloud Pro, Cloud Advanced, or Grafana Enterprise customer.
1. When reporting issues, include:
   - Grafana version and plugin version.
   - Error messages (redact sensitive information).
   - Steps to reproduce the issue.
   - Relevant configuration (redact credentials).
