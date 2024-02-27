package main

import (
	"context"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"os"

	"github.com/grafana/athena-datasource/pkg/athena"
	"github.com/grafana/athena-datasource/pkg/athena/routes"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func main() {
	// Start listening to requests sent from Grafana.
	if err := datasource.Manage(
		"grafana-athena-datasource",
		MakeDatasourceFactory(),
		datasource.ManageOpts{},
	); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}

func MakeDatasourceFactory() datasource.InstanceFactoryFunc {
	return func(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
		log.DefaultLogger.FromContext(ctx).Debug("building new datasource instance")
		s := athena.New()
		ds := awsds.NewAsyncAWSDatasource(s)
		ds.Completable = s
		ds.EnableMultipleConnections = true
		ds.CustomRoutes = routes.New(s).Routes()
		return ds.NewDatasource(ctx, settings)
	}
}
