# Changelog

## 2.3.0

- Add Async Query Data Support

## 2.2.3

- Update @grafana dependencies to v8.5.10

## 2.2.2

- Security: Upgrade Go in build process to 1.19.3

## 2.2.1

- Security: Upgrade Go in build process to 1.19.2

## 2.2.0

- Upgrade to grafana-aws-sdk v0.11.0 by @fridgepoet in https://github.com/grafana/athena-datasource/pull/175

Full Changelog: https://github.com/grafana/athena-datasource/compare/v2.1.0...v2.2.0

## 2.1.0

- Add support for context aware autocompletion by @sunker in https://github.com/grafana/athena-datasource/pull/171

## 2.0.1

- Fix bug with caching invalid auth args (https://github.com/grafana/athena-datasource/issues/144)
- Code coverage and Codeowners updates

## 2.0.0

- Stopping support for Grafana versions under `8.0.0` .
- Add template variables as options to Athena connection details (#151)
- Fix error message not forwarded when listing resources in config editor (#141)

## 1.0.5

- Fixes a bug that caused invalid tokens when assuming a role in private clouds (e.g. `gov`).

## 1.0.4

- Add macros to output the raw starting or ending time of the panel's range

## 1.0.3

- Fixes bugs for Endpoint and Assume Role settings

## 1.0.2

- Includes a curated dashboard for Amazon VPC Flow Logs.
- Fixes a bug in which modifications to the data source configuration were not being applied (#105).
- Add User-Agent to requests.

## 1.0.1

Fixes a bug that caused several instances of the plugin to accidentally connect to the same instance.

## 1.0.0

Initial release.

## 0.2.3

Add macros for Epoch & Unix timestamp data.

## 0.2.2

Fix queries with missing data

## 0.2.1

Improve tooltip text.

## 0.2.0

Allow to set data source output location.

## 0.1.2

Allow to cancel and stop requests. Bug fixing.

## 0.1.1

Added a curated dashboard

## 0.1.0

Initial release.
