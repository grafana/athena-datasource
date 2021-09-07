# Grafana data source backend plugin template

[![Build](https://github.com/grafana/grafana-starter-datasource-backend/workflows/CI/badge.svg)](https://github.com/grafana/grafana-datasource-backend/actions?query=workflow%3A%22CI%22)

This template is a starting point for building Grafana data source backend plugins.

## What is the Grafana data source backend plugin?

Grafana supports a wide range of data sources, including Prometheus, MySQL, and Datadog. There’s a good chance you can already visualize metrics from the systems that you have already set up. In cases where you have an in-house metrics solution that you’d like to add to your Grafana dashboards, Grafana data source plugins allow you to integrate such solutions with Grafana.

For more information about backend plugins, refer to the documentation on [Backend plugins](https://grafana.com/docs/grafana/latest/developers/plugins/backend/).

## Getting started

A data source backend plugin consists of both frontend and backend components.

### Build the frontend

1. Install any dependencies:

   ```bash
   yarn install
   ```

2. Build the plugin in development mode or run in watch mode:

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build the plugin in production mode:

   ```bash
   yarn build
   ```

### Build the backend

1. Update the [Grafana plugin SDK for Go](https://grafana.com/docs/grafana/latest/developers/plugins/backend/grafana-plugin-sdk-for-go/) dependency to the latest minor version:

   ```bash
   go get -u github.com/grafana/grafana-plugin-sdk-go
   go mod tidy
   ```

2. Build the backend plugin binaries for Linux, Windows, and Darwin:

   ```bash
   mage -v
   ```

3. List all of the available Mage targets for additional commands:

   ```bash
   mage -l
   ```

### Acknowledgment

The backend driver is based on the implementation of [uber/athenadriver](https://github.com/uber/athenadriver), which provides a fully-featured driver for AWS Athena.
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

## Learn more

- [Build a data source backend plugin tutorial](https://grafana.com/tutorials/build-a-data-source-backend-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/) - Grafana tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI library](https://developers.grafana.com/ui) - UI components to help you build interfaces using the Grafana Design System
- [Grafana plugin SDK for Go](https://grafana.com/docs/grafana/latest/developers/plugins/backend/grafana-plugin-sdk-for-go/)
