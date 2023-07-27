package athena

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	"github.com/grafana/athena-datasource/pkg/athena/driver"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/datasource"
	awsDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver"
	asyncDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver/async"
	sqlModels "github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"
)

type athenaQueryArgs struct {
	Region, Catalog, Database  string
	ResultReuseEnabled         bool
	ResultReuseMaxAgeInMinutes int64
}

type awsDSClient interface {
	Init(config backend.DataSourceInstanceSettings)
	GetDB(id int64, options sqlds.Options, settingsLoader sqlModels.Loader, apiLoader sqlAPI.Loader, driverLoader awsDriver.Loader) (*sql.DB, error)
	GetAsyncDB(id int64, options sqlds.Options, settingsLoader sqlModels.Loader, apiLoader sqlAPI.Loader, driverLoader asyncDriver.Loader) (awsds.AsyncDB, error)
	GetAPI(id int64, options sqlds.Options, settingsLoader sqlModels.Loader, apiLoader sqlAPI.Loader) (sqlAPI.AWSAPI, error)
}
type AthenaDatasource struct {
	awsDS awsDSClient
}

type AthenaDatasourceIface interface {
	sqlds.Driver
	sqlds.Completable
	sqlAPI.Resources
	awsds.AsyncDriver
	DataCatalogs(ctx context.Context, options sqlds.Options) ([]string, error)
	Databases(ctx context.Context, options sqlds.Options) ([]string, error)
	Workgroups(ctx context.Context, options sqlds.Options) ([]string, error)
	WorkgroupEngineVersion(ctx context.Context, options sqlds.Options) (string, error)
	Tables(ctx context.Context, options sqlds.Options) ([]string, error)
	Columns(ctx context.Context, options sqlds.Options) ([]string, error)
}

func New() AthenaDatasourceIface {
	return &AthenaDatasource{awsDS: datasource.New()}
}

func (s *AthenaDatasource) Settings(_ backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{
		FillMode: &data.FillMissing{
			Mode: data.FillModeNull,
		},
	}
}

// Connect opens a sql.DB connection using datasource settings
func (s *AthenaDatasource) Connect(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (*sql.DB, error) {
	s.awsDS.Init(config)
	args, err := parseArgs(queryArgs)
	if err != nil {
		return nil, err
	}
	args["updated"] = config.Updated.String()

	// athena datasources require a region to establish a connection, we use a default region if none was provided
	if args["region"] == "" {
		args["region"] = sqlModels.DefaultKey
	}

	return s.awsDS.GetDB(config.ID, args, models.New, api.New, driver.NewSync)
}

func (s *AthenaDatasource) GetAsyncDB(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (awsds.AsyncDB, error) {
	s.awsDS.Init(config)
	args, err := parseArgs(queryArgs)
	if err != nil {
		return nil, err
	}
	args["updated"] = config.Updated.String()

	// athena datasources require a region to establish a connection, we use a default region if none was provided
	if args["region"] == "" {
		args["region"] = sqlModels.DefaultKey
	}

	return s.awsDS.GetAsyncDB(config.ID, args, models.New, api.New, driver.New)
}

func (s *AthenaDatasource) Converters() (sc []sqlutil.Converter) {
	return sc
}

func (s *AthenaDatasource) getAPI(ctx context.Context, options sqlds.Options) (*api.API, error) {
	id := datasource.GetDatasourceID(ctx)
	// the lastUpdated time makes sure that we don't use a token for a stale version of the datasource
	lastUpdated := datasource.GetDatasourceLastUpdatedTime(ctx)
	// we only require region for getting an api, the rest of the options are used per-query
	args := sqlds.Options{"region": options["region"], "updated": lastUpdated}
	res, err := s.awsDS.GetAPI(id, args, models.New, api.New)
	if err != nil {
		return nil, err
	}
	return res.(*api.API), err
}

func (s *AthenaDatasource) CancelQuery(ctx context.Context, options sqlds.Options, queryID string) error {
	api, err := s.getAPI(ctx, options)
	if err != nil {
		return err
	}
	return api.CancelQuery(ctx, options, queryID)
}

func (s *AthenaDatasource) Schemas(ctx context.Context, options sqlds.Options) ([]string, error) {
	// Athena uses an approach known as schema-on-read
	// Ref: https://docs.aws.amazon.com/athena/latest/ug/creating-tables.html
	return []string{}, nil
}

func (s *AthenaDatasource) Tables(ctx context.Context, options sqlds.Options) ([]string, error) {
	api, err := s.getAPI(ctx, options)
	if err != nil {
		return nil, err
	}
	return api.Tables(ctx, options)
}

func (s *AthenaDatasource) Columns(ctx context.Context, options sqlds.Options) ([]string, error) {
	if options["table"] == "" {
		return []string{}, nil
	}
	api, err := s.getAPI(ctx, options)
	if err != nil {
		return nil, err
	}
	return api.Columns(ctx, options)
}

func (s *AthenaDatasource) Regions(ctx context.Context) ([]string, error) {
	api, err := s.getAPI(ctx, sqlds.Options{})
	if err != nil {
		return nil, err
	}
	return api.Regions(ctx)
}

func (s *AthenaDatasource) DataCatalogs(ctx context.Context, options sqlds.Options) ([]string, error) {
	api, err := s.getAPI(ctx, options)
	if err != nil {
		return nil, err
	}
	return api.DataCatalogs(ctx)
}

func (s *AthenaDatasource) Databases(ctx context.Context, options sqlds.Options) ([]string, error) {
	api, err := s.getAPI(ctx, options)
	if err != nil {
		return nil, err
	}
	return api.Databases(ctx, options)
}

func (s *AthenaDatasource) Workgroups(ctx context.Context, options sqlds.Options) ([]string, error) {
	api, err := s.getAPI(ctx, options)
	if err != nil {
		return nil, err
	}
	return api.Workgroups(ctx)
}

func (s *AthenaDatasource) WorkgroupEngineVersion(ctx context.Context, options sqlds.Options) (string, error) {
	api, err := s.getAPI(ctx, options)
	if err != nil {
		return "", err
	}
	return api.WorkgroupEngineVersion(ctx, options)
}

func parseArgs(queryArgs json.RawMessage) (sqlds.Options, error) {
	args := athenaQueryArgs{}
	if queryArgs != nil {
		err := json.Unmarshal(queryArgs, &args)
		if err != nil {
			return nil, fmt.Errorf("failed to parse query args: %w", err)
		}
	}
	options := sqlds.Options{}
	if args.Region != "" {
		options[models.Region] = args.Region
	}
	if args.Catalog != "" {
		options[models.Catalog] = args.Catalog
	}
	if args.Database != "" {
		options[models.Database] = args.Database
	}
	if args.ResultReuseEnabled {
		options[models.ResultReuseEnabled] = fmt.Sprintf("%t", args.ResultReuseEnabled)
	}
	if args.ResultReuseMaxAgeInMinutes > 0 {
		options[models.ResultReuseMaxAgeInMinutes] = fmt.Sprintf("%d", args.ResultReuseMaxAgeInMinutes)
	}
	return options, nil
}
