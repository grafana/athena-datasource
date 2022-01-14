package api

import (
	"context"
	"errors"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/athena"
	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	sqlModels "github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/sqlds/v2"
)

type API struct {
	Client   athenaiface.AthenaAPI
	settings *models.AthenaDataSourceSettings
}

func New(sessionCache *awsds.SessionCache, settings sqlModels.Settings) (api.AWSAPI, error) {
	athenaSettings := settings.(*models.AthenaDataSourceSettings)
	sess, err := sessionCache.GetSession(awsds.SessionConfig{
		Settings:      athenaSettings.AWSDatasourceSettings,
		Config:        athenaSettings.Config,
		UserAgentName: aws.String("Athena"),
	})
	if err != nil {
		return nil, err
	}

	return &API{Client: athena.New(sess), settings: athenaSettings}, nil
}

func (c *API) Execute(ctx context.Context, input *api.ExecuteQueryInput) (*api.ExecuteQueryOutput, error) {
	athenaInput := &athena.StartQueryExecutionInput{
		QueryString: aws.String(input.Query),
		QueryExecutionContext: &athena.QueryExecutionContext{
			Catalog:  aws.String(c.settings.Catalog),
			Database: aws.String(c.settings.Database),
		},
		WorkGroup: aws.String(c.settings.WorkGroup),
	}

	if c.settings.OutputLocation != "" {
		athenaInput.ResultConfiguration = &athena.ResultConfiguration{
			OutputLocation: aws.String(c.settings.OutputLocation),
		}
	}

	output, err := c.Client.StartQueryExecutionWithContext(ctx, athenaInput)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", api.ExecuteError, err)
	}

	return &api.ExecuteQueryOutput{ID: *output.QueryExecutionId}, nil
}

func (c *API) Status(ctx aws.Context, output *api.ExecuteQueryOutput) (*api.ExecuteQueryStatus, error) {
	statusResp, err := c.Client.GetQueryExecutionWithContext(ctx, &athena.GetQueryExecutionInput{
		QueryExecutionId: aws.String(output.ID),
	})
	if err != nil {
		return nil, fmt.Errorf("%w: %v", api.ExecuteError, err)
	}

	var finished bool
	state := *statusResp.QueryExecution.Status.State
	switch state {
	case athena.QueryExecutionStateFailed:
		finished = true
		err = errors.New(*statusResp.QueryExecution.Status.StateChangeReason)
	case athena.QueryExecutionStateSucceeded:
		finished = true
	default:
		finished = false
	}
	return &api.ExecuteQueryStatus{
		ID:       output.ID,
		State:    state,
		Finished: finished,
	}, err
}

func (c *API) Stop(output *api.ExecuteQueryOutput) error {
	_, err := c.Client.StopQueryExecution(&athena.StopQueryExecutionInput{
		QueryExecutionId: &output.ID,
	})
	if err != nil {
		return fmt.Errorf("%w: unable to stop query", err)
	}
	return nil
}

// regions from https://docs.aws.amazon.com/general/latest/gr/athena.html
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
	"eu-central-1",
	"eu-north-1",
	"eu-south-1",
	"eu-west-1",
	"eu-west-2",
	"eu-west-3",
	"me-south-1",
	"sa-east-1",
	"us-east-1",
	"us-east-2",
	"us-gov-east-1",
	"us-gov-west-1",
	"us-west-1",
	"us-west-2",
}

func (c *API) Regions(aws.Context) ([]string, error) {
	return standardRegions, nil
}

func (c *API) getOptionWithDefault(options sqlds.Options, option string) string {
	v, ok := options[option]
	if !ok {
		return ""
	}
	if v == sqlModels.DefaultKey {
		switch option {
		case "region":
			v = c.settings.DefaultRegion
		case "catalog":
			v = c.settings.Catalog
		case "database":
			v = c.settings.Database
		}
	}
	return v
}

func (c *API) DataCatalogs(ctx context.Context) ([]string, error) {
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

func (c *API) Databases(ctx aws.Context, options sqlds.Options) ([]string, error) {
	catalog := c.getOptionWithDefault(options, "catalog")
	res := []string{}
	var nextToken *string
	isFinished := false
	if catalog == sqlModels.DefaultKey {
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

func (c *API) Workgroups(ctx context.Context) ([]string, error) {
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

func (c *API) Tables(ctx aws.Context, options sqlds.Options) ([]string, error) {
	catalog, database := c.getOptionWithDefault(options, "catalog"), c.getOptionWithDefault(options, "database")
	res := []string{}
	var nextToken *string
	isFinished := false
	for !isFinished {
		out, err := c.Client.ListTableMetadataWithContext(ctx, &athena.ListTableMetadataInput{
			CatalogName:  aws.String(catalog),
			DatabaseName: aws.String(database),
			NextToken:    nextToken,
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

func (c *API) Columns(ctx aws.Context, options sqlds.Options) ([]string, error) {
	catalog, database := c.getOptionWithDefault(options, "catalog"), c.getOptionWithDefault(options, "database")
	table := options["table"]
	res := []string{}
	out, err := c.Client.GetTableMetadataWithContext(ctx, &athena.GetTableMetadataInput{
		CatalogName:  aws.String(catalog),
		DatabaseName: aws.String(database),
		TableName:    aws.String(table),
	})
	if err != nil {
		return nil, err
	}
	for _, cat := range out.TableMetadata.Columns {
		res = append(res, *cat.Name)
	}
	return res, nil
}
