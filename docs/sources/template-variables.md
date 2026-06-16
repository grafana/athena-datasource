---
aliases:
  - /docs/plugins/grafana-athena-datasource/template-variables/
description: Use template variables with the Amazon Athena data source in Grafana.
keywords:
  - grafana
  - amazon athena
  - athena
  - aws
  - template variables
  - variables
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Template variables
title: Amazon Athena template variables
weight: 400
last_reviewed: 2026-02-20
---

# Amazon Athena template variables

Use template variables to create dynamic, reusable dashboards. Template variables let you parameterize queries so that dashboard viewers can change values without editing the query.

## Before you begin

Before you use template variables, ensure you have the following prerequisites.

- [Configure the Amazon Athena data source](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/configure/).
- Understand [Grafana template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/).

## Supported variable types

The Amazon Athena data source supports the following variable types.

| Variable type | Supported |
| ------------- | --------- |
| Query | Yes |
| Custom | Yes |
| Data source | Yes |

## Create a query variable

To create a query variable:

1. Navigate to **Dashboard settings** > **Variables**.
1. Click **Add variable**.
1. Select **Query** as the variable type.
1. Select the Amazon Athena data source.
1. Enter a SQL query that returns the values you want to use as variable options.

For more information, refer to [Add a query variable](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/add-template-variables/#add-a-query-variable).

## Query examples

Any value queried from an Amazon Athena table can be used as a variable. The following examples show common variable queries.

### List distinct values from a column

```sql
SELECT DISTINCT region FROM my_table
```

### Use custom display names

To display a custom name for each variable option while using a different value, alias the columns as `text` and `value`. The `value` column must be a string type or cast to a string type.

```sql
SELECT hostname AS text, id AS value FROM my_table
```

## Use variables in queries

After creating a variable, reference it in your Amazon Athena queries using [variable syntax](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/variable-syntax/). For example, use `$variable_name` or `${variable_name}` in your SQL queries.

```sql
SELECT time, value
FROM my_table
WHERE region = '$region'
ORDER BY time ASC
```

Template variables are also supported in the query editor's resource selectors (Region, Catalog, Database, Table, and Column drop-downs).

## Next steps

- [Amazon Athena query editor](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/query-editor/)
- [Grafana template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/)
