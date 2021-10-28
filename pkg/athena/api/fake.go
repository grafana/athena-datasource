package api

import (
	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
	"github.com/grafana/athena-datasource/pkg/athena/models"
)

// NewFake returns an API object with the given args
func NewFake(cli athenaiface.AthenaAPI, settings *models.AthenaDataSourceSettings) *API {
	return &API{Client: cli, settings: settings}
}
