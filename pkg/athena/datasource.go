package athena

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	"github.com/grafana/athena-datasource/pkg/athena/driver"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"
	"github.com/pkg/errors"
)

type connection struct {
	db     *sql.DB
	driver *driver.Driver
	api    *api.API
}

type AthenaDatasource struct {
	SessionCache *awsds.SessionCache

	connections sync.Map
	config      backend.DataSourceInstanceSettings
}

type AthenaDatasourceIface interface {
	sqlds.Driver
	DataCatalogs(ctx context.Context, region string) ([]string, error)
	Databases(ctx context.Context, region, catalog string) ([]string, error)
	Workgroups(ctx context.Context, region string) ([]string, error)
}

type ConnectionArgs struct {
	Region   string `json:"region,omitempty"`
	Catalog  string `json:"catalog,omitempty"`
	Database string `json:"database,omitempty"`
}

func (s *AthenaDatasource) Settings(_ backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{
		FillMode: &data.FillMissing{
			Mode: data.FillModeNull,
		},
	}
}

func parseConnectionArgs(queryArgs json.RawMessage) (*ConnectionArgs, error) {
	args := &ConnectionArgs{}
	if queryArgs != nil {
		err := json.Unmarshal(queryArgs, args)
		if err != nil {
			return nil, fmt.Errorf("error reading query params: %s", err.Error())
		}
	}
	return args, nil
}

func applySettings(defaultSettings *models.AthenaDataSourceSettings, args *ConnectionArgs) (*models.AthenaDataSourceSettings, error) {
	settings := *defaultSettings
	if args.Region != "" {
		if args.Region == models.DefaultKey {
			settings.Region = settings.DefaultRegion
		} else {
			settings.Region = args.Region
		}
	}

	if args.Catalog != "" && args.Catalog != models.DefaultKey {
		settings.Catalog = args.Catalog
	}

	if args.Database != "" && args.Database != models.DefaultKey {
		settings.Database = args.Database
	}

	return &settings, nil
}

func (s *AthenaDatasource) athenaSettings(args *ConnectionArgs) (*models.AthenaDataSourceSettings, string, error) {
	defaultSettings := &models.AthenaDataSourceSettings{}
	err := defaultSettings.Load(s.config)
	if err != nil {
		return nil, "", fmt.Errorf("error reading settings: %s", err.Error())
	}
	connectionKey := defaultSettings.GetConnectionKey(args.Region, args.Catalog, args.Database)

	settings, err := applySettings(defaultSettings, args)
	if err != nil {
		return nil, "", errors.WithMessage(err, "Failed to parse settings")
	}
	return settings, connectionKey, nil
}

// Connect opens a sql.DB connection using datasource settings
func (s *AthenaDatasource) Connect(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (*sql.DB, error) {
	s.config = config
	args, err := parseConnectionArgs(queryArgs)
	if err != nil {
		return nil, err
	}
	settings, key, err := s.athenaSettings(args)
	if err != nil {
		return nil, err
	}

	// avoid to create a new connection if the arguments have not changed
	c, exists := s.connections.Load(key)
	if exists {
		connection := c.(connection)
		if !connection.driver.Closed() {
			return connection.db, nil
		}
	}

	api, err := api.New(s.SessionCache, settings)
	if err != nil {
		return nil, errors.WithMessage(err, "Failed to create athena client")
	}
	dr, db, err := driver.Open(settings, api.Client)
	if err != nil {
		return nil, errors.WithMessage(err, "Failed to connect to database. Is the hostname and port correct?")
	}
	s.connections.Store(key, connection{driver: dr, db: db, api: api})
	return db, nil
}

func (s *AthenaDatasource) Converters() (sc []sqlutil.Converter) {
	return sc
}

func (s *AthenaDatasource) Schemas(ctx context.Context) ([]string, error) {
	// TBD
	return []string{}, nil
}

func (s *AthenaDatasource) Tables(ctx context.Context, schema string) ([]string, error) {
	// TBD
	return []string{}, nil
}

func (s *AthenaDatasource) Columns(ctx context.Context, table string) ([]string, error) {
	// TBD
	return []string{}, nil
}

func (s *AthenaDatasource) DataCatalogs(ctx context.Context, region string) ([]string, error) {
	settings, key, err := s.athenaSettings(&ConnectionArgs{Region: region})
	if err != nil {
		return nil, err
	}
	c, exists := s.connections.Load(key)
	if !exists {
		api, err := api.New(s.SessionCache, settings)
		if err != nil {
			return nil, errors.WithMessage(err, "Failed to create athena client")
		}
		return api.ListDataCatalogs(ctx)
	}
	return c.(connection).api.ListDataCatalogs(ctx)
}

func (s *AthenaDatasource) Databases(ctx context.Context, region, catalog string) ([]string, error) {
	settings, key, err := s.athenaSettings(&ConnectionArgs{Region: region, Catalog: catalog})
	if err != nil {
		return nil, err
	}
	c, exists := s.connections.Load(key)
	if !exists {
		api, err := api.New(s.SessionCache, settings)
		if err != nil {
			return nil, errors.WithMessage(err, "Failed to create athena client")
		}
		return api.ListDatabases(ctx, settings.Catalog)
	}
	return c.(connection).api.ListDatabases(ctx, settings.Catalog)
}

func (s *AthenaDatasource) Workgroups(ctx context.Context, region string) ([]string, error) {
	settings, key, err := s.athenaSettings(&ConnectionArgs{Region: region})
	if err != nil {
		return nil, err
	}
	c, exists := s.connections.Load(key)
	if !exists {
		api, err := api.New(s.SessionCache, settings)
		if err != nil {
			return nil, errors.WithMessage(err, "Failed to create athena client")
		}
		return api.ListWorkgroups(ctx)
	}
	return c.(connection).api.ListWorkgroups(ctx)
}
