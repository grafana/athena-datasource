---
aliases:
  - /docs/plugins/grafana-athena-datasource/alerting/
description: Set up Grafana Alerting with the Amazon Athena data source.
keywords:
  - grafana
  - amazon athena
  - athena
  - aws
  - alerting
  - alerts
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Alerting
title: Amazon Athena alerting
weight: 460
last_reviewed: 2026-02-20
---

# Amazon Athena alerting

Use [Grafana Alerting](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/) with the Amazon Athena data source to receive notifications when your data meets specific conditions. For example, you can create alerts that trigger when error counts exceed a threshold or when costs rise above a budget.

## Before you begin

Before you set up alerting, ensure you have the following prerequisites.

- [Configure the Amazon Athena data source](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/configure/).
- Understand how to use the [Amazon Athena query editor](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/query-editor/).
- Understand [Grafana Alerting concepts](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/fundamentals/).

## Create an alert rule

To create an alert rule using the Amazon Athena data source:

1. Click **Alerting** in the left-side menu.
1. Click **Alert rules**.
1. Click **New alert rule**.
1. Enter a name for the alert rule.
1. Select the Amazon Athena data source.
1. Write a SQL query that returns the numeric value you want to evaluate.
1. Configure the alert condition by selecting a reducer (such as **Last** or **Mean**) and a threshold.
1. Set the evaluation interval and pending period.
1. Configure notification settings and click **Save rule and exit**.

## Query requirements for alerting

Alert rule queries must return numeric data that Grafana can evaluate against a threshold. Follow these guidelines when writing queries for alert rules.

- **Return a numeric value:** The query must return at least one numeric column that Grafana can evaluate.
- **Use time-series format:** Select the **Time series** format in the query editor. The query needs a time column in ascending order and a numeric value column.
- **Keep queries efficient:** Alert queries run at the configured evaluation interval. Use filters, partitions, and narrow time ranges to reduce data scanned and query execution time.
- **Use macros for time filtering:** Use `$__timeFilter(column)` to automatically filter data to the alert evaluation window.

### Example alert query

The following query counts errors per minute, which can be evaluated against a threshold.

```sql
SELECT
  $__timeGroup(time, '1m') AS time,
  COUNT(*) AS error_count
FROM error_logs
WHERE $__timeFilter(time) AND level = 'ERROR'
GROUP BY 1
ORDER BY 1 ASC
```

## Performance considerations

Amazon Athena queries run asynchronously, which means they may take longer to complete than queries from other data sources. Keep the following considerations in mind when configuring alert rules.

- **Evaluation interval:** Set an evaluation interval that accounts for Athena query execution time. Queries that scan large amounts of data may take several seconds or longer to complete.
- **Query result reuse:** Enable [query result reuse](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/query-editor/#query-result-reuse) to reduce costs and query time for alert queries that run frequently. This requires Athena engine version 3.
- **Data scan costs:** Each alert evaluation runs a query against Athena, which incurs costs based on data scanned. Use partitioned tables and add `WHERE` clause filters to minimize the amount of data scanned per evaluation.
- **Query caching:** Enable [query caching](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/data-source-management/#query-caching) to reduce the number of queries sent to Athena (available in Grafana Enterprise and Grafana Cloud).

## Next steps

- [Configure notification policies](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/configure-notifications/)
- [Create contact points](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/configure-notifications/manage-contact-points/)
- [Grafana Alerting documentation](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/)
