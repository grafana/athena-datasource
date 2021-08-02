package main

import (
	"os"

	"github.com/grafana/athena-datasource/pkg/athena"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/sqlds"
)

func main() {
	// Start listening to requests sent from Grafana.
	s := &athena.AthenaDatasource{}
	ds := sqlds.NewDatasource(s)
	ds.Completable = s

	if err := datasource.Manage(
		"grafana-athena-datasource",
		ds.NewDatasource,
		datasource.ManageOpts{},
	); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
