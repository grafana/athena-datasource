package main

import (
	"os"

	"github.com/grafana/athena-datasource/pkg/athena"
	"github.com/grafana/athena-datasource/pkg/athena/routes"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/sqlds/v2"
)

func main() {
	// Start listening to requests sent from Grafana.
	s := athena.New()
	ds := sqlds.NewDatasource(s)
	ds.Completable = s
	ds.EnableMultipleConnections = true
	ds.CustomRoutes = routes.New(s).Routes()

	if err := datasource.Manage(
		"grafana-athena-datasource",
		ds.NewDatasource,
		datasource.ManageOpts{},
	); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
