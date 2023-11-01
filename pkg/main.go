package main

import (
	"context"
	"os"

	"github.com/grafana/athena-datasource/pkg/athena"
	"github.com/grafana/athena-datasource/pkg/athena/routes"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func main() {
	// Start listening to requests sent from Grafana.
	s := athena.New()
	ds := awsds.NewAsyncAWSDatasource(s)
	ds.Completable = s
	ds.EnableMultipleConnections = true
	ds.CustomRoutes = routes.New(s).Routes()

	// newDatasourceForUpgradedPluginSdk adds context to the NewDatasource function, which is the new signature expected
	// for an InstanceFactoryFunc in grafana-plugin-sdk-go
	// TODO: Remove this function and create a NewDatasource method with Context in grafana-aws-sdk, see https://github.com/grafana/oss-plugin-partnerships/issues/648
	newDatasourceForUpgradedPluginSdk := func(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
		return ds.NewDatasource(settings)
	}

	if err := datasource.Manage(
		"grafana-athena-datasource",
		newDatasourceForUpgradedPluginSdk,
		datasource.ManageOpts{},
	); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
