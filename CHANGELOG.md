# Changelog

## 2.10.1

- Update dependencies and rebuild lockfile

## 2.10.0

- Upgrade @grafana/aws-sdk to v0.0.47 to support numeric values when applying template variables to SQL queries

## 2.9.6

- Fix: include partitions as columns https://github.com/grafana/athena-datasource/pull/244
- Fix: update go modules to fix column types being treated as strings https://github.com/grafana/athena-datasource/pull/252

## 2.9.5

- Fix: allow returning nil for missing values https://github.com/grafana/athena-datasource/pull/241
- Fix: handle expression queries correctly for async queries https://github.com/grafana/athena-datasource/pull/240

## 2.9.4

- Upgrade Readme.md re: Grafana 10 https://github.com/grafana/athena-datasource/pull/237

## 2.9.3

- Upgrade grafana/aws-sdk-react to 0.0.46 https://github.com/grafana/athena-datasource/pull/235

## 2.9.2

- Revert grafana-plugin-sdk-go version to 0.139.0 to fix https://github.com/grafana/athena-datasource/issues/233. Should be same behavior as behavior with no known issues.
- Update grafana-aws-sdk version to include new region to opt-in region list https://github.com/grafana/grafana-aws-sdk/pull/80

## 2.9.1

- Update async-query-data with a fix for errors in [#232](https://github.com/grafana/athena-datasource/pull/232)

## 2.9.0

- Update backend dependencies

## 2.8.0

- Add Query Result Reuse Support to Frontend by @kevinwcyu in [#215](https://github.com/grafana/athena-datasource/pull/215)

## 2.7.0

- Add header to Query Editor by @idastambuk in [#217](https://github.com/grafana/athena-datasource/pull/211)
- Add Query Result Reuse Support to Backend by @kevinwcyu in [#214](https://github.com/grafana/athena-datasource/pull/214)

## 2.6.0

- Hide Run query buttons in annotations in https://github.com/grafana/athena-datasource/pull/211

## 2.5.0

- Upgrade AWS go SDK to latest version by @annerajb in https://github.com/grafana/athena-datasource/pull/208

## 2.4.0

- Migrate to create-plugin by @iwysiu in https://github.com/grafana/athena-datasource/pull/190
- Update code coverage version to 0.1.13 by @idastambuk in https://github.com/grafana/athena-datasource/pull/197
- Re-enable annotations e2e test by @kevinwcyu in https://github.com/grafana/athena-datasource/pull/198
- A11y: Add a11y lint plugin by @idastambuk in https://github.com/grafana/athena-datasource/pull/199
- Upgrade grafana-aws-sdk to v0.12.0 by @fridgepoet in https://github.com/grafana/athena-datasource/pull/203

## 2.3.1

- Hide the stop button when async query data support is not enabled https://github.com/grafana/athena-datasource/pull/193
- Interpolate query properties with variables only if property is set https://github.com/grafana/athena-datasource/pull/194

## 2.3.0

- Add Async Query Data Support https://github.com/grafana/athena-datasource/pull/174

## 2.2.3

- Update @grafana dependencies to v8.5.10 https://github.com/grafana/athena-datasource/pull/191

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
