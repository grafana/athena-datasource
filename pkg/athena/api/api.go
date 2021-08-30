package api

import (
	"context"

	"github.com/aws/aws-sdk-go/service/athena"
	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
)

type API struct {
	Client   athenaiface.AthenaAPI
	settings *models.AthenaDataSourceSettings
}

func New(sessionCache *awsds.SessionCache, settings *models.AthenaDataSourceSettings) (*API, error) {
	region := settings.DefaultRegion
	if settings.Region != "" {
		region = settings.Region
	}
	session, err := sessionCache.GetSession(region, settings.AWSDatasourceSettings)
	if err != nil {
		return nil, err
	}
	return &API{athena.New(session), settings}, nil
}

func (c *API) ListDataCatalogs(ctx context.Context) ([]string, error) {
	res := []string{}
	var nextToken *string
	isFinished := false
	for !isFinished {
		out, err := c.Client.ListDataCatalogsWithContext(ctx, &athena.ListDataCatalogsInput{
			NextToken: nextToken,
		})
		if err != nil {
			return nil, err
		}
		nextToken = out.NextToken
		for _, cat := range out.DataCatalogsSummary {
			res = append(res, *cat.CatalogName)
		}
		if nextToken == nil {
			isFinished = true
		}
	}
	return res, nil
}