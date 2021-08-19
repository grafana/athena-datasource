package main

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/grafana/athena-datasource/pkg/athena"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/sqlds"
)

// regions from https://github.com/grafana/grafana-aws-sdk/blob/main/src/regions.ts
var standardRegions = []string{
	"af-south-1",
	"ap-east-1",
	"ap-northeast-1",
	"ap-northeast-2",
	"ap-northeast-3",
	"ap-south-1",
	"ap-southeast-1",
	"ap-southeast-2",
	"ca-central-1",
	"cn-north-1",
	"cn-northwest-1",
	"eu-central-1",
	"eu-north-1",
	"eu-west-1",
	"eu-west-2",
	"eu-west-3",
	"me-south-1",
	"sa-east-1",
	"us-east-1",
	"us-east-2",
	"us-gov-east-1",
	"us-gov-west-1",
	"us-iso-east-1",
	"us-isob-east-1",
	"us-west-1",
	"us-west-2",
}

func main() {
	// Start listening to requests sent from Grafana.
	s := &athena.AthenaDatasource{}
	ds := sqlds.NewDatasource(s)
	ds.Completable = s
	ds.CustomRoutes = map[string]func(http.ResponseWriter, *http.Request){
		"/regions": func(rw http.ResponseWriter, r *http.Request) {
			rw.Header().Add("Content-Type", "application/json")
			// TODO: Replace with a resolved list of regions
			res, err := json.Marshal(standardRegions)
			if err != nil {
				log.DefaultLogger.Error(err.Error())
			}
			_, err = rw.Write(res)
			if err != nil {
				log.DefaultLogger.Error(err.Error())
			}
		},
	}

	if err := datasource.Manage(
		"grafana-athena-datasource",
		ds.NewDatasource,
		datasource.ManageOpts{},
	); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
