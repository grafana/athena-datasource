package api

import (
	"context"
	"errors"
	"fmt"

	athenatypes "github.com/aws/aws-sdk-go-v2/service/athena/types"
	"github.com/grafana/athena-datasource/pkg/athena/api/mock"
	drv "github.com/uber/athenadriver/go"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/athena"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsauth"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	sqlModels "github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	sdkhttpclient "github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/sqlds/v4"
)

type Client interface {
	drv.AthenaClient

	athena.ListDataCatalogsAPIClient
	athena.ListDatabasesAPIClient
	athena.ListWorkGroupsAPIClient
	athena.ListTableMetadataAPIClient

	GetTableMetadata(context.Context, *athena.GetTableMetadataInput, ...func(*athena.Options)) (*athena.GetTableMetadataOutput, error)
}

var _ Client = &mock.MockAthenaClient{}

type API struct {
	Client   Client
	settings *models.AthenaDataSourceSettings
}

func New(ctx context.Context, settings sqlModels.Settings) (api.AWSAPI, error) {
	athenaSettings := settings.(*models.AthenaDataSourceSettings)

	httpClientProvider := sdkhttpclient.NewProvider()
	httpClientOptions, err := athenaSettings.Config.HTTPClientOptions(ctx)
	if err != nil {
		backend.Logger.Error("failed to create HTTP client options", "error", err.Error())
		return nil, err
	}
	httpClient, err := httpClientProvider.New(httpClientOptions)
	if err != nil {
		backend.Logger.Error("failed to create HTTP client", "error", err.Error())
		return nil, err
	}
	region := athenaSettings.Region
	if region == "" || region == "default" {
		region = athenaSettings.DefaultRegion
	}

	cfg, err := awsauth.NewConfigProvider().GetConfig(ctx, awsauth.Settings{
		LegacyAuthType:     athenaSettings.AuthType,
		AccessKey:          athenaSettings.AccessKey,
		SecretKey:          athenaSettings.SecretKey,
		Region:             region,
		CredentialsProfile: athenaSettings.Profile,
		AssumeRoleARN:      athenaSettings.AssumeRoleARN,
		Endpoint:           athenaSettings.Endpoint,
		ExternalID:         athenaSettings.ExternalID,
		HTTPClient:         httpClient,
		UserAgent:          "athena",
	})
	if err != nil {
		return nil, err
	}

	return &API{Client: athena.NewFromConfig(cfg), settings: athenaSettings}, nil
}

func (c *API) Execute(ctx context.Context, input *api.ExecuteQueryInput) (*api.ExecuteQueryOutput, error) {
	athenaInput := &athena.StartQueryExecutionInput{
		QueryString: aws.String(input.Query),
		QueryExecutionContext: &athenatypes.QueryExecutionContext{
			Catalog:  aws.String(c.settings.Catalog),
			Database: aws.String(c.settings.Database),
		},
		WorkGroup: aws.String(c.settings.WorkGroup),
	}

	version, err := c.WorkgroupEngineVersion(ctx, sqlds.Options{"workgroup": c.settings.WorkGroup})

	if err != nil {
		return nil, getExecuteError(err)
	}

	if workgroupEngineSupportsResultReuse(version) {
		athenaInput.ResultReuseConfiguration = &athenatypes.ResultReuseConfiguration{
			ResultReuseByAgeConfiguration: &athenatypes.ResultReuseByAgeConfiguration{
				Enabled:         c.settings.ResultReuseEnabled,
				MaxAgeInMinutes: aws.Int32(c.settings.ResultReuseMaxAgeInMinutes),
			},
		}
	}

	if c.settings.OutputLocation != "" {
		athenaInput.ResultConfiguration = &athenatypes.ResultConfiguration{
			OutputLocation: aws.String(c.settings.OutputLocation),
		}
	}

	output, err := c.Client.StartQueryExecution(ctx, athenaInput)
	if err != nil {
		return nil, getExecuteError(err)
	}

	return &api.ExecuteQueryOutput{ID: *output.QueryExecutionId}, nil
}

// GetQueryID always returns not found. To actually check if the query has already been called would require calling
// ListQueryExecutions, which has a limit of 5 calls per second. This leads to throttling when there are many panels
// and/or many query executions to page through
func (c *API) GetQueryID(ctx context.Context, query string, args ...interface{}) (bool, string, error) {
	return false, "", nil
}

func (c *API) Status(ctx context.Context, output *api.ExecuteQueryOutput) (*api.ExecuteQueryStatus, error) {
	statusResp, err := c.Client.GetQueryExecution(ctx, &athena.GetQueryExecutionInput{
		QueryExecutionId: aws.String(output.ID),
	})
	if err != nil {
		return nil, backend.DownstreamError(fmt.Errorf("%w: %v", api.ErrorExecute, err))
	}

	var finished bool
	state := statusResp.QueryExecution.Status.State
	switch state {
	case athenatypes.QueryExecutionStateFailed, athenatypes.QueryExecutionStateCancelled:
		finished = true
		err = backend.DownstreamError(
			errors.New(*statusResp.QueryExecution.Status.StateChangeReason))

		// if internal athena error (error category 1), return an error with cause FailedInternal
		// which will be converted to response.error.status 500 in grafana/aws-sdk/awsds
		// similarly for error category 2 and status 400
		// https://docs.aws.amazon.com/athena/latest/APIReference/API_AthenaError.html
		errorCategory := getErrorCategory(statusResp)
		if errorCategory != nil {
			switch *errorCategory {
			case 1:
				err = &awsds.QueryExecutionError{Cause: awsds.QueryFailedInternal, Err: err}
			case 2:
				err = &awsds.QueryExecutionError{Cause: awsds.QueryFailedUser, Err: err}
			}
		}

	case athenatypes.QueryExecutionStateSucceeded:
		finished = true
	default:
		finished = false
	}
	return &api.ExecuteQueryStatus{
		ID:       output.ID,
		State:    string(state),
		Finished: finished,
	}, err
}

func (c *API) CancelQuery(ctx context.Context, options sqlds.Options, queryID string) error {
	return c.Stop(&api.ExecuteQueryOutput{ID: queryID})
}

func (c *API) Stop(output *api.ExecuteQueryOutput) error {
	_, err := c.Client.StopQueryExecution(context.TODO(), &athena.StopQueryExecutionInput{
		QueryExecutionId: &output.ID,
	})
	if err != nil {
		return backend.DownstreamError(fmt.Errorf("%w: unable to stop query", err))
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

func (c *API) Regions(_ context.Context) ([]string, error) {
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
		out, err := c.Client.ListDataCatalogs(ctx, &athena.ListDataCatalogsInput{
			NextToken: nextToken,
		})
		if err != nil {
			return nil, backend.DownstreamError(err)
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

func (c *API) Databases(ctx context.Context, options sqlds.Options) ([]string, error) {
	catalog := c.getOptionWithDefault(options, "catalog")
	res := []string{}
	var nextToken *string
	isFinished := false
	if catalog == sqlModels.DefaultKey {
		catalog = c.settings.Catalog
	}
	for !isFinished {
		out, err := c.Client.ListDatabases(ctx, &athena.ListDatabasesInput{
			NextToken:   nextToken,
			CatalogName: aws.String(catalog),
		})
		if err != nil {
			return nil, backend.DownstreamError(err)
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
		out, err := c.Client.ListWorkGroups(ctx, &athena.ListWorkGroupsInput{
			NextToken: nextToken,
		})
		if err != nil {
			return nil, backend.DownstreamError(err)
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

func (c *API) WorkgroupEngineVersion(ctx context.Context, options sqlds.Options) (string, error) {
	workgroup := c.getOptionWithDefault(options, "workgroup")
	out, err := c.Client.GetWorkGroup(ctx, &athena.GetWorkGroupInput{WorkGroup: aws.String(workgroup)})
	if err != nil {
		return "", err
	}

	return *out.WorkGroup.Configuration.EngineVersion.EffectiveEngineVersion, nil
}

func (c *API) Tables(ctx context.Context, options sqlds.Options) ([]string, error) {
	catalog, database := c.getOptionWithDefault(options, "catalog"), c.getOptionWithDefault(options, "database")
	res := []string{}
	var nextToken *string
	isFinished := false
	for !isFinished {
		out, err := c.Client.ListTableMetadata(ctx, &athena.ListTableMetadataInput{
			CatalogName:  aws.String(catalog),
			DatabaseName: aws.String(database),
			NextToken:    nextToken,
		})
		if err != nil {
			return nil, backend.DownstreamError(err)
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

func (c *API) Columns(ctx context.Context, options sqlds.Options) ([]string, error) {
	catalog, database := c.getOptionWithDefault(options, "catalog"), c.getOptionWithDefault(options, "database")
	table := options["table"]
	res := []string{}
	out, err := c.Client.GetTableMetadata(ctx, &athena.GetTableMetadataInput{
		CatalogName:  aws.String(catalog),
		DatabaseName: aws.String(database),
		TableName:    aws.String(table),
	})
	if err != nil {
		return nil, backend.DownstreamError(err)
	}
	for _, cat := range out.TableMetadata.Columns {
		res = append(res, *cat.Name)
	}
	for _, par := range out.TableMetadata.PartitionKeys {
		res = append(res, *par.Name)
	}
	return res, nil
}

func workgroupEngineSupportsResultReuse(version string) bool {
	return version != "Athena engine version 2"
}

func getExecuteError(err error) error {
	var invalidRequest *athenatypes.InvalidRequestException
	if errors.As(err, &invalidRequest) {
		return &awsds.QueryExecutionError{Cause: awsds.QueryFailedUser, Err: backend.DownstreamError(fmt.Errorf("%w: %v", api.ErrorExecute, err))}
	}
	var internalError *athenatypes.InternalServerException
	if errors.As(err, &internalError) {
		return &awsds.QueryExecutionError{Cause: awsds.QueryFailedInternal, Err: backend.DownstreamError(fmt.Errorf("%w: %v", api.ErrorExecute, err))}
	}
	return backend.DownstreamError(fmt.Errorf("%w: %v", api.ErrorExecute, err))
}

func getErrorCategory(errorOutput *athena.GetQueryExecutionOutput) *int32 {
	if errorOutput == nil ||
		errorOutput.QueryExecution == nil ||
		errorOutput.QueryExecution.Status == nil ||
		errorOutput.QueryExecution.Status.AthenaError == nil {
		return nil
	}
	return errorOutput.QueryExecution.Status.AthenaError.ErrorCategory
}
