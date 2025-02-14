package api

import (
	"github.com/grafana/athena-datasource/pkg/athena/models"
)

// NewFake returns an API object with the given args
func NewFake(cli Client, settings *models.AthenaDataSourceSettings) *API {
	return &API{Client: cli, settings: settings}
}
