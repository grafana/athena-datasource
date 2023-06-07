# Building and releasing

## How to build the Athena data source plugin locally

## Dependencies

Make sure you have the following dependencies installed first:

- [Git](https://git-scm.com/)
- [Go](https://golang.org/dl/) (see [go.mod](../go.mod#L3) for minimum required version)
- [Mage](https://magefile.org/)
- [Node.js (Long Term Support)](https://nodejs.org)
- [Yarn](https://yarnpkg.com)

## Frontend

1. Install dependencies

   ```bash
   yarn install --pure-lockfile
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Backend

1. Build the backend binaries

   ```bash
   mage -v
   ```

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

### Pre-requisites

Before doing a release, make sure that the GitHub repository is configured with a `GRAFANA_API_KEY` to be able to sign the plugin and that the Golang and Node versions in the [release.yaml](./.github/workflows/release.yaml) workflow are correct.

Also, make sure that the path to the plugin validator in the [release.yaml](./.github/workflows/release.yaml#L122) is correct (this fixes the error `pushd: ./plugin-validator/cmd/plugincheck: No such file or directory`):

```
pushd ./plugin-validator/pkg/cmd/plugincheck`
```

### Release

You need to have commit rights to the GitHub repository to publish a release.

1. Update the version number in the `package.json` file.
2. Update the `CHANGELOG.md` with the changes contained in the release.
3. Commit the changes to master and push to GitHub.
4. Follow the Drone release process that you can find [here](https://github.com/grafana/integrations-team/wiki/Plugin-Release-Process#drone-release-process)
