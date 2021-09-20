package api

import (
	"context"

	"github.com/aws/aws-sdk-go/aws"
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

func (c *API) ListDatabases(ctx context.Context, catalog string) ([]string, error) {
	res := []string{}
	var nextToken *string
	isFinished := false
	if catalog == models.DefaultKey {
		catalog = c.settings.Catalog
	}
	for !isFinished {
		out, err := c.Client.ListDatabasesWithContext(ctx, &athena.ListDatabasesInput{
			NextToken:   nextToken,
			CatalogName: aws.String(catalog),
		})
		if err != nil {
			return nil, err
		}
		nextToken = out.NextToken
		for _, cat := range out.DatabaseList {
			res = append(res, *cat.Name)
		}
		if nextToken == nil {
			isFinished = true
		}
	}
	return res, nil
}

func (c *API) ListWorkgroups(ctx context.Context) ([]string, error) {
	res := []string{}
	var nextToken *string
	isFinished := false
	for !isFinished {
		out, err := c.Client.ListWorkGroupsWithContext(ctx, &athena.ListWorkGroupsInput{
			NextToken: nextToken,
		})
		if err != nil {
			return nil, err
		}
		nextToken = out.NextToken
		for _, cat := range out.WorkGroups {
			res = append(res, *cat.Name)
		}
		if nextToken == nil {
			isFinished = true
		}
	}
	return res, nil
}

func (c *API) ListTables(ctx aws.Context, catalog string, database string)([]string, error) {
	res := []string{}
	var nextToken *string
	isFinished := false
	for !isFinished {
		out, err := c.Client.ListTableMetadataWithContext(ctx, &athena.ListTableMetadataInput{
			CatalogName: aws.String(catalog),
			DatabaseName: aws.String(database),
			NextToken: nextToken,
		})
		if err != nil {
			return nil, err
		}
		nextToken = out.NextToken
		for _, cat := range out.TableMetadataList {
			res = append(res, *cat.Name)
		}
		if nextToken == nil {
			isFinished = true
		}
	}
	return res, nil
}

func (c *API) ListColumnsForTable(ctx aws.Context, catalog string, database string, table string)([]string, error) {
	res := []string{}
	out, err := c.Client.GetTableMetadataWithContext(ctx, &athena.GetTableMetadataInput{
		CatalogName: aws.String(catalog),
		DatabaseName: aws.String(database),
		TableName: aws.String(table),
	})
	if err != nil {
		return nil, err
	}	
	for _, cat := range out.TableMetadata.Columns {
		res = append(res, *cat.Name)
	}
	return res, nil
}
