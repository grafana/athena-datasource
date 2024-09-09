# Changelog

## 2.17.2

- Bump dependencies in [#347](https://github.com/grafana/athena-datasource/pull/347), [#365](https://github.com/grafana/athena-datasource/pull/365), [#360](https://github.com/grafana/athena-datasource/pull/360), [#361](https://github.com/grafana/athena-datasource/pull/361), [#359](https://github.com/grafana/athena-datasource/pull/359), [#358](https://github.com/grafana/athena-datasource/pull/358), [#357](https://github.com/grafana/athena-datasource/pull/357), [#355](https://github.com/grafana/athena-datasource/pull/355), [#348](https://github.com/grafana/athena-datasource/pull/348), [#351](https://github.com/grafana/athena-datasource/pull/351), [#365](https://github.com/grafana/athena-datasource/pull/365)
- Add errorsource in [#344](https://github.com/grafana/athena-datasource/pull/344)

## 2.17.1

- Update grafana/aws-sdk to get new regions in [#341](https://github.com/grafana/athena-datasource/pull/341)

## 2.17.0

- Migrate to new form styling in config and query editors in [#337](https://github.com/grafana/athena-datasource/pull/337)

## 2.16.2

- Fix: use ReadAuthSettings to get authSettings in [#339](https://github.com/grafana/athena-datasource/pull/339)

## 2.16.1

- Chore: update dependencies in [#332](https://github.com/grafana/athena-datasource/pull/332)

## 2.16.0

- Plugin.json: update schema reference URL by @leventebalogh in [#328](https://github.com/grafana/athena-datasource/pull/328)
- add stalebot to issues by @katebrenner in [#329](https://github.com/grafana/athena-datasource/pull/329)
- docs: fix 'Using accessKey and secretKey' example by @kstevensonnv in [#331](https://github.com/grafana/athena-datasource/pull/331)
- chore: replace GetSession with GetSessionWithAuthSettings by @njvrzm in [#333](https://github.com/grafana/athena-datasource/pull/333)

## 2.15.0

- Update for added context in grafana-aws-sdk by @njvrzm in [#326](https://github.com/grafana/athena-datasource/pull/326)

## 2.14.1

- Bump @grafana/aws-sdk from v0.3.1 to v0.3.3 in [#321](https://github.com/grafana/athena-datasource/pull/321)

## 2.14.0

- Remove the athenaAsyncQuerySupport feature toggle + styling improvements in [#316](https://github.com/grafana/athena-datasource/pull/316)

## 2.13.6

- Fix: Rebuild the datasource when settings change in [#314](https://github.com/grafana/athena-datasource/pull/314)
- Bring in [security fixes in go 1.21.8](https://groups.google.com/g/golang-announce/c/5pwGVUPoMbg)
- Remove outdated release instructions from CONTRIBUTING.md

## 2.13.5

- Update grafana-aws-sdk from v0.19.3 to v0.23.0 and sqlds from v2.3.10 to v3.2.0 in [#310](https://github.com/grafana/athena-datasource/pull/310)
- Update @grafana/async-query-data from 0.1.10 to 0.1.11 in [#311](https://github.com/grafana/athena-datasource/pull/311)

## 2.13.4

- Update README.md: Updates installation, configuration and authentication in [#300](https://github.com/grafana/athena-datasource/pull/300)
- Bump grafana-aws-sdk from v0.19.1 to v0.19.3 in [#304](https://github.com/grafana/athena-datasource/pull/304)

## 2.13.3

- Query Editor improvements: Update query with defaults on mount and filter out empty queries in [#303](https://github.com/grafana/athena-datasource/pull/30)

## 2.13.2

- Bump go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc from 0.45.0 to 0.46.0 by @dependabot in https://github.com/grafana/athena-datasource/pull/298
- Add debug, underscore to resolutions in package.json by @fridgepoet in https://github.com/grafana/athena-datasource/pull/299

## 2.13.1

- Bump google.golang.org/grpc from 1.58.2 to 1.58.3 in [#295] https://github.com/grafana/athena-datasource/pull/295
- Bump go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace from 0.37.0 to 0.44.0 in [#290] https://github.com/grafana/athena-datasource/pull/290

## 2.13.0

- Bump google.golang.org/grpc from 1.54.0 to 1.56.3 in [#294] https://github.com/grafana/athena-datasource/pull/294
- Query and Config editors: Migrate to new form styling under the `awsDatasourcesNewFormstyling` feature toggle in [#293] https://github.com/grafana/athena-datasource/pull/293
- Bump semver from 5.7.1 to 5.7.2 in [#292] https://github.com/grafana/athena-datasource/pull/292
- Support Node 18 in [#276] https://github.com/grafana/athena-datasource/pull/276

## 2.12.0

- Add support for Temporary Credentials [#284] https://github.com/grafana/athena-datasource/pull/284

## 2.11.1

- Update @grafana/aws-sdk to 0.1.2 to fix bug with temporary credentials

## 2.11.0

- Update grafana-aws-sdk to v0.19.1 to add `il-central-1` to opt-in region list

## 2.10.3

- Upgrade @grafana/async-query-data to reduce minimum query time https://github.com/grafana/athena-datasource/pull/265

## 2.10.2

- Upgrade @grafana/aws-sdk to v0.0.48 to use @grafana/runtime instead of grafanaBootData [#267](https://github.com/grafana/athena-datasource/pull/267)
- Remove unused updated field from structs [#263](https://github.com/grafana/athena-datasource/pull/263)
- Fix connection error when changing access and secret key [#262](https://github.com/grafana/athena-datasource/pull/262)

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
