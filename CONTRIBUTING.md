# Contributing

## Signed commits are required

> [!IMPORTANT]
> All commits must be [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits) (GPG, SSH, or S/MIME) to be merged into this repository. Pull requests with unsigned commits will need to be re-committed with signatures before they can be merged.

# Building and releasing

## How to build the Athena data source plugin locally

## Dependencies

Make sure you have the following dependencies installed first:

- [Git](https://git-scm.com/)
- [Go](https://golang.org/dl/) (see [go.mod](../go.mod#L3) for minimum required version)
- [Mage](https://magefile.org/)
- [Node.js (Long Term Support)](https://nodejs.org)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Frontend

1. Install dependencies

   ```bash
   npm ci
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   npm run dev
   ```

   or

   ```bash
   npm run watch
   ```

3. Build plugin in production mode

   ```bash
   npm run build
   ```

## Backend

1. Build the backend binaries

   ```bash
   mage -v
   ```

## Data Source Configuration Schema

`pkg/schema/dsconfig.json` is the **single source of truth** for the data source's
configuration surface — every field a user can set, where it is stored (`root`,
`jsonData`, `secureJsonData`), its type, validation rules and UI hints. It is consumed by
provisioning tooling, documentation and automation.

The schema format is defined and documented by [`grafana/dsconfig`](https://github.com/grafana/dsconfig/tree/main/dsconfig):

- [README](https://github.com/grafana/dsconfig/tree/main/dsconfig#readme) — concepts and a worked example for each field shape (root / jsonData / secret / array / virtual), plus current gaps and limitations.
- [`schema.md`](https://github.com/grafana/dsconfig/blob/main/dsconfig/schema.md) — full property reference.
- [`schema.json`](https://github.com/grafana/dsconfig/blob/main/dsconfig/schema.json) — the JSON Schema `dsconfig.json` validates against. It is pinned via the `$schema` key at the top of our file, so editors autocomplete from it; bump that URL when you bump `github.com/grafana/dsconfig/schema` in `go.mod`.

The rest of this section covers only what is specific to this plugin.

### Layout

| File in `pkg/schema/` | Description                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `dsconfig.json`        | Source of truth — **edit this**                                                                            |
| `dsconfig_test.go`     | Wires the schema into the shared conformance suite; also holds `SecureKeys`                                |
| `*.gen.json`           | Generated artifacts — **never hand-edit**; `webpack.config.ts` copies them into `dist/schema/` on `npm run build`/`npm run dev` |

Unlike some other plugins, there is no separate schema-only Go model here — the conformance
suite checks the schema directly against the real runtime settings struct,
`pkg/athena/models.AthenaDataSourceSettings`. That struct embeds
`awsds.AWSDatasourceSettings` from `grafana-aws-sdk`, so most of the generic AWS auth
fields (`authType`, `region`, `defaultRegion`, `assumeRoleARN`, `externalId`, `profile`,
`endpoint`, ...) live on that embedded type in a separate module, not in this repo.

Note that field `id`s in this schema use a dotted `<target>.<key>` convention (e.g.
`jsonData.workgroup`), unlike the underscore convention (`jsonData_workgroup`) some other
plugins' schemas use — match whichever convention a given `dsconfig.json` already uses.

### Adding a new settings option

1. **Declare the field** in `pkg/schema/dsconfig.json` under `fields`, and add its `id` to
   the appropriate `groups[].fieldRefs` entry.
2. **Add the matching Go field**:
   - Athena-specific settings (`catalog`, `database`, `workgroup`, `outputLocation`,
     `resultReuseEnabled`, `resultReuseMaxAgeInMinutes`, ...) go directly on
     `AthenaDataSourceSettings` in `pkg/athena/models/settings.go`, with a json tag equal
     to the schema `key`.
   - Generic AWS auth settings go on `awsds.AWSDatasourceSettings` in `grafana-aws-sdk`
     instead — that's a separate repo/module, so land the field there first, then bump
     `github.com/grafana/grafana-aws-sdk` in `go.mod` once it's released.
   - This parity is enforced in both directions — a field in the schema but not the struct
     (or vice versa) fails the test suite. Secrets (`target: secureJsonData`) are the
     exception: they get no struct field (they're read straight out of
     `DecryptedSecureJSONData` in `Load()`), but their key must be added to `SecureKeys` in
     `pkg/schema/dsconfig_test.go`.
3. **Regenerate the artifacts** and commit them with your change:

   ```bash
   go generate ./pkg/schema/...
   ```

4. **Verify**:

   ```bash
   go test ./pkg/schema/...
   ```

### When the conformance suite fails

Most failures are self-explanatory from the assertion message. The three you are most
likely to hit:

- `SchemaArtifactInSync` — a `.gen.json` file has drifted. Run `go generate ./pkg/schema/...` and commit the result.
- `JSONDataMatchesStruct` / `JSONDataTypesMatchStruct` — the schema and `AthenaDataSourceSettings` (including its embedded `awsds.AWSDatasourceSettings` fields) disagree on keys or types. Update whichever side is behind.
- `SecureValuesMatchLoadSettings` — the schema's `secureJsonData` fields and `SecureKeys` disagree.

## Setting up a go workspace

Setting up go workspace can be helpful when making changes across modules like `grafana-aws-sdk` and `sqlds` and wanting to see those changes reflected in the Athena data source.

From https://go.dev/blog/get-familiar-with-workspaces:

> Workspaces in Go 1.18 let you work on multiple modules simultaneously without having to edit go.mod files for each module. Each module within a workspace is treated as a main module when resolving dependencies.
>
> Previously, to add a feature to one module and use it in another module, you needed to either publish the changes to the first module, or edit the go.mod file of the dependent module with a replace directive for your local, unpublished module changes. In order to publish without errors, you had to remove the replace directive from the dependent module’s go.mod file after you published the local changes to the first module.

1. Make a new directory somewhere, for example `athena_workspace`
2. `cd athena_workspace`
3. `git clone https://github.com/grafana/athena-datasource.git`
4. `git clone https://github.com/grafana/grafana-aws-sdk`
5. `git clone https://github.com/grafana/sqlds`
6. `go work init ./athena-datasource ./grafana-aws-sdk ./sqlds`
7. Make modifications in any of these directories and build the backend in `athena-datasource` with `mage` as usual. The changes in these directories will be taken into account.

If you build Grafana locally, you can for example symlink `athena-datasource` to your clone of `github.com/grafana/grafana`'s `data/plugins` directory, e.g. `cd <path to your Grafana repo>/github.com/grafana/grafana/data/plugins && ln -s <path to your workspaces>/athena_workspace/athena-datasource athena-datasource`

## Build a release for the Athena data source plugin

You need to have commit rights to the GitHub repository to publish a release.

1. Update the version number in the `package.json` file.
2. Update the `CHANGELOG.md` with the changes contained in the release.
3. Commit the changes to master and push to GitHub.
4. Follow the release process that you can find [here](https://enghub.grafana-ops.net/docs/default/component/grafana-plugins-platform/plugins-ci-github-actions/010-plugins-ci-github-actions/#cd_1)
