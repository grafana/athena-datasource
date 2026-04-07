---
aliases:
  - /docs/plugins/grafana-athena-datasource/
description: Use the Amazon Athena data source to query and visualize Amazon Athena data in Grafana.
keywords:
  - grafana
  - amazon athena
  - athena
  - aws
  - data source
  - enterprise
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Amazon Athena
title: Amazon Athena data source
weight: 100
last_reviewed: 2026-02-20
---

# Amazon Athena data source

The Amazon Athena data source plugin lets you query and visualize data stored in Amazon Athena directly in Grafana dashboards. Amazon Athena is an interactive query service that uses standard SQL to analyze data in Amazon S3.

## Supported features

The following table lists the features available with this data source.

| Feature | Supported |
| ----------- | --------- |
| Metrics | Yes |
| Logs | No |
| Traces | No |
| Alerting | Yes |
| Annotations | Yes |

## Get started

The following pages help you get started with the Amazon Athena data source.

- [Configure the Amazon Athena data source](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/configure/)
- [Amazon Athena query editor](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/query-editor/)
- [Template variables](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/template-variables/)
- [Alerting](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/alerting/)
- [Annotations](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/annotations/)
- [Troubleshooting](https://grafana.com/docs/plugins/grafana-athena-datasource/latest/troubleshooting/)

## Additional features

After configuring the data source, you can use the following Grafana features.

- Use [Explore](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/explore/) to query data without building a dashboard.
- Add [Transformations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/panels-visualizations/query-transform-data/transform-data/) to manipulate query results.
- Set up [Alerting](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/) rules to get notified when data changes.
- Configure and use [Template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/) for dynamic dashboards.

## Pre-built dashboards

The Amazon Athena data source ships with the following pre-built dashboards. To import them, navigate to the data source configuration page and select the **Dashboards** tab.

- **Cost Usage Report Monitoring:** Monitor AWS cost and usage reports stored in Amazon S3 and queried through Athena.
- **Amazon VPC Flow Logs:** Analyze VPC flow log data for network traffic monitoring and security analysis.

## Plugin updates

Always ensure that your plugin version is up-to-date so you have access to all current features and improvements. Navigate to **Plugins and data** > **Plugins** to check for updates. Grafana recommends upgrading to the latest Grafana version, and this applies to plugins as well.

{{< admonition type="note" >}}
Plugins are automatically updated in Grafana Cloud.
{{< /admonition >}}

## Related resources

- [Amazon Athena documentation](https://docs.aws.amazon.com/athena/latest/ug/what-is.html)
- [Athena data source plugin GitHub repository](https://github.com/grafana/athena-datasource/)
- [Grafana community forum](https://community.grafana.com/)
