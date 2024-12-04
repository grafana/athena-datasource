# Changelog

## 2.18.0

- Bump sqlds and grafana-plugin-sdk-go for error source improvements in [#462](https://github.com/grafana/athena-datasource/pull/462)
- Dependabot updates
  - @emotion/css from 11.13.4 to 11.13.5
  - @grafana/async-query-data from 0.2.0 to 0.3.0
  - @grafana/data from 11.2.2 to 11.3.1
  - @grafana/eslint-config from 7.0.0 to 8.0.0
  - @grafana/experimental from 2.1.2 to 2.1.4
  - @grafana/runtime from 11.2.2 to 11.3.1
  - @grafana/schema from 11.2.2 to 11.3.1
  - @grafana/ui from 11.3.0 to 11.3.1
  - tslib from 2.7.0 to 2.8.1
  - @babel/core from 7.25.8 to 7.26.0
  - @swc/core from 1.7.35 to 1.9.3
  - @swc/helpers from 0.5.13 to 0.5.15
  - @swc/jest from 0.2.36 to 0.2.37
  - @testing-library/jest-dom from 6.5.0 to 6.6.3
  - @types/jest from 29.5.13 to 29.5.14
  - @types/lodash from 4.17.10 to 4.17.13
  - @types/node from 22.7.5 to 22.9.3
  - cross-spawn from 7.0.3 to 7.0.6
  - cspell from 8.15.2 to 8.16.0
  - eslint-plugin-jsx-a11y from 6.10.0 to 6.10.2
  - lefthook from 1.7.18 to 1.8.4
  - react-router-dom from 6.28.0 to 7.0.1
  - sass from 1.79.5 to 1.81.0
  - sass-loader from 16.0.2 to 16.0.3
  - typescript from 5.6.3 to 5.7.2
  - webpack from 5.95.0 to 5.96.1
  - github.com/grafana/grafana-aws-sdk from 0.31.3 to 0.31.4
  - github.com/grafana/grafana-plugin-sdk-go from 0.259.2 to 0.259.4
  - github.com/stretchr/testify from 1.9.0 to 1.10.0

## 2.17.5

- Bugfix: Bump uber/athenadriver to 1.1.15 in #448
- Chore: group dependabot updates and use a weekly interval in #443
- Query Editor: Fix field options not loading in #437
- Chore: Update plugin.json keywords in #434
- Dependabot updates
  - Bump @types/node from 22.7.2 to 22.7.5
  - Bump @babel/core from 7.25.2 to 7.25.7
  - Bump @emotion/css from 11.13.0 to 11.13.4
  - Updates @grafana/data from 11.2.1 to 11.2.2
  - Updates @grafana/experimental from 2.1.0 to 2.1.2
  - Updates @grafana/runtime from 11.2.1 to 11.2.2
  - Updates @grafana/schema from 11.2.1 to 11.2.2
  - Updates @grafana/ui from 11.2.1 to 11.2.2
  - Updates @grafana/aws-sdk from 0.4.2 to 0.5.0
  - Bump webpack from 5.94.0 to 5.95.0
  - Bump sass from 1.79.3 to 1.79.5
  - Bump lefthook from 1.7.17 to 1.7.18
  - Bump github.com/grafana/sqlds/v4 from 4.1.1 to 4.1.2
  - Bump github.com/grafana/grafana-aws-sdk from 0.31.2 to 0.31.3
  - Bump @types/lodash from 4.17.7 to 4.17.10
  - Bump @swc/core from 1.7.26 to 1.7.35 (#426)
  - Bump @types/node from 22.5.5 to 22.7.2 (#425)
  - Bump lefthook from 1.7.16 to 1.7.17 (#424)
  - Bump @types/jest from 29.5.12 to 29.5.13
  - Bump lefthook from 1.7.15 to 1.7.16
  - Bump sass-loader from 16.0.1 to 16.0.2
  - Bump cspell from 8.14.2 to 8.15.2
  - Bump github.com/grafana/grafana-plugin-sdk-go from 0.250.2 to 0.251.0
  - Bump github/combine-prs from 5.1.0 to 5.2.0
  - Bump typescript from 5.6.2 to 5.6.3

## 2.17.4

- Mark errors when interpolating macros errors as downstream in [#410](https://github.com/grafana/athena-datasource/pull/410)
- Bump github.com/grafana/grafana-plugin-sdk-go from 0.248.0 to 0.250.2 in [#410](https://github.com/grafana/athena-datasource/pull/410)
- Dependabot updates
  - Bump github.com/grafana/grafana-aws-sdk from 0.31.0 to 0.31.2
  - Bump @types/node from 22.5.3 to 22.5.5
  - Bump @babel/core from 7.24.7 to 7.25.2
  - Bump @swc/helpers from 0.5.11 to 0.5.13
  - Bump @testing-library/jest-dom and @types/testing-library\_\_jest-dom

## 2.17.3

- Update Athena to Amazon Athena
- fix: don't check slice nilness before length check in [#385](https://github.com/grafana/athena-datasource/pull/385)
- chore: add manual "combine PRs" action in [#386](https://github.com/grafana/athena-datasource/pull/3586)
- Dependabot updates (some merged via combined PRs):
  - [#352](https://github.com/grafana/athena-datasource/pull/352): Bump github.com/aws/aws-sdk-go from 1.51.31 to 1.55.5
  - [#362](https://github.com/grafana/athena-datasource/pull/362): Bump typescript from 5.4.5 to 5.5.4
  - [#363](https://github.com/grafana/athena-datasource/pull/363): Bump eslint-plugin-prettier from 5.1.3 to 5.2.1
  - [#364](https://github.com/grafana/athena-datasource/pull/364): Bump sass-loader from 14.2.1 to 16.0.1
  - [#368](https://github.com/grafana/athena-datasource/pull/368): Bump micromatch from 4.0.7 to 4.0.8
  - [#370](https://github.com/grafana/athena-datasource/pull/370): Bump the dependencies group across 1 directory with 8 updates
  - [#372](https://github.com/grafana/athena-datasource/pull/372): Bump github.com/grafana/grafana-plugin-sdk-go from 0.228.0 to 0.245.0
  - [#373](https://github.com/grafana/athena-datasource/pull/373): Bump webpack from 5.92.1 to 5.94.0
  - [#376](https://github.com/grafana/athena-datasource/pull/376): Bump @testing-library/react from 16.0.0 to 16.0.1
  - [#379](https://github.com/grafana/athena-datasource/pull/379): Bump @types/node from 22.5.0 to 22.5.3
  - [#380](https://github.com/grafana/athena-datasource/pull/380): Bump github.com/grafana/grafana-plugin-sdk-go from 0.245.0 to 0.246.0
  - [#382](https://github.com/grafana/athena-datasource/pull/382): Bump cypress from 9.5.1 to 12.17.4
  - [#388](https://github.com/grafana/athena-datasource/pull/388): Bump github.com/grafana/grafana-plugin-sdk-go from 0.246.0 to 0.247.0
  - [#393](https://github.com/grafana/athena-datasource/pull/393): Bump @emotion/css from 11.10.6 to 11.13.0
  - [#395](https://github.com/grafana/athena-datasource/pull/395): Bump typescript from 5.5.4 to 5.6.2
  - [#397](https://github.com/grafana/athena-datasource/pull/397): Bump github.com/grafana/grafana-plugin-sdk-go from 0.247.0 to 0.248.0
  - [#398](https://github.com/grafana/athena-datasource/pull/398): Bump path-to-regexp from 1.8.0 to 1.9.0
  - [#400](https://github.com/grafana/athena-datasource/pull/400): Bump the dependencies group across 1 directory with 4 updates
  - [#383](https://github.com/grafana/athena-datasource/pull/383): Bump eslint-plugin-jsx-a11y from 6.9.0 to 6.10.0
  - [#381](https://github.com/grafana/athena-datasource/pull/381): Bump sass from 1.77.8 to 1.78.0
  - [#374](https://github.com/grafana/athena-datasource/pull/374): Bump github.com/grafana/sqlds/v4 from 4.1.0 to 4.1.1
  - [#366](https://github.com/grafana/athena-datasource/pull/366): Bump prettier from 3.3.2 to 3.3.3
  - [#350](https://github.com/grafana/athena-datasource/pull/350): Bump actions/setup-node from 3 to 4
  - [#349](https://github.com/grafana/athena-datasource/pull/349): Bump tibdex/github-app-token from 1.8.0 to 2.1.0
  - [#392](https://github.com/grafana/athena-datasource/pull/392): Bump @swc/helpers from 0.5.11 to 0.5.13

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
