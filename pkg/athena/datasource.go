package athena

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	"github.com/grafana/athena-datasource/pkg/athena/driver"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"
)

type AthenaDatasource struct {
	awsDS *datasource.AWSDatasource
}

func New() AthenaDatasourceIface {
	return &AthenaDatasource{awsDS: datasource.New()}
}

type AthenaDatasourceIface interface {
	sqlds.Driver
	sqlds.Completable
	sqlAPI.Resources
	DataCatalogs(ctx context.Context, options sqlds.Options) ([]string, error)
	Workgroups(ctx context.Context, options sqlds.Options) ([]string, error)
	Tables(ctx context.Context, options sqlds.Options) ([]string, error)
	Columns(ctx context.Context, options sqlds.Options) ([]string, error)
}

func (s *AthenaDatasource) Settings(_ backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{
		FillMode: &data.FillMissing{
			Mode: data.FillModeNull,
		},
	}
}

func (s *AthenaDatasource) Converters() (sc []sqlutil.Converter) {
	return sc
}

// Connect opens a sql.DB connection using datasource settings
func (s *AthenaDatasource) Connect(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (*sql.DB, error) {
	s.awsDS.StoreConfig(config)
	args, err := sqlds.ParseOptions(queryArgs)
	if err != nil {
		return nil, err
	}

	return s.awsDS.GetDB(config.ID, args, models.New, api.New, driver.New)
}

func (s *AthenaDatasource) getAPI(ctx context.Context, options sqlds.Options) (*api.API, error) {
	id := datasource.GetDatasourceID(ctx)
	res, err := s.awsDS.GetAPI(id, options, models.New, api.New)
	if err != nil {
		return nil, err
	}
	return res.(*api.API), err
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
