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
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
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
	sessionCache *awsds.SessionCache
	connections  sync.Map
	config       sync.Map
}

type AthenaDatasourceIface interface {
	sqlds.Driver
	DataCatalogs(ctx context.Context, region string) ([]string, error)
	Databases(ctx context.Context, region, catalog string) ([]string, error)
	Workgroups(ctx context.Context, region string) ([]string, error)
	TablesWithConnectionDetails(ctx context.Context, region, catalog, database string) ([]string, error)
	ColumnsWithConnectionDetails(ctx context.Context, region, catalog, database, table string) ([]string, error)
}

type ConnectionArgs struct {
	Region   string `json:"region,omitempty"`
	Catalog  string `json:"catalog,omitempty"`
	Database string `json:"database,omitempty"`
}

func New() *AthenaDatasource {
	return &AthenaDatasource{
		sessionCache: awsds.NewSessionCache(),
	}
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

func (s *AthenaDatasource) defaultSettings(id int64) (*models.AthenaDataSourceSettings, error) {
	defaultSettings := &models.AthenaDataSourceSettings{}
	config, ok := s.config.Load(id)
	if !ok {
		return nil, errors.Errorf("unable to find stored configuration for datasource %d", id)
	}
	err := defaultSettings.Load(config.(backend.DataSourceInstanceSettings))
	if err != nil {
		return nil, fmt.Errorf("error reading settings: %s", err.Error())
	}
	return defaultSettings, nil
}

func (s *AthenaDatasource) connectionKey(id int64, defaultSettings *models.AthenaDataSourceSettings, args *ConnectionArgs) string {
	return defaultSettings.GetConnectionKey(id, args.Region, args.Catalog, args.Database)
}

func (s *AthenaDatasource) athenaSettings(defaultSettings *models.AthenaDataSourceSettings, args *ConnectionArgs) (*models.AthenaDataSourceSettings, error) {
	settings, err := applySettings(defaultSettings, args)
	if err != nil {
		return nil, errors.WithMessage(err, "Failed to parse settings")
	}
	return settings, nil
}

// Connect opens a sql.DB connection using datasource settings
func (s *AthenaDatasource) Connect(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (*sql.DB, error) {
	s.config.Store(config.ID, config)
	args, err := parseConnectionArgs(queryArgs)
	if err != nil {
		return nil, err
	}
	defaultSettings, err := s.defaultSettings(config.ID)
	if err != nil {
		return nil, err
	}
	settings, err := s.athenaSettings(defaultSettings, args)
	if err != nil {
		return nil, err
	}
	key := s.connectionKey(config.ID, defaultSettings, args)

	// avoid to create a new connection if the arguments have not changed
	c, exists := s.connections.Load(key)
	if exists {
		connection := c.(connection)
		if !connection.driver.Closed() {
			return connection.db, nil
		}
	}

	api, err := api.New(s.sessionCache, settings)
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

// do not use Tables, use TablesWithConnectionDetails instead
func (s *AthenaDatasource) Tables(ctx context.Context, schema string) ([]string, error) {
	return []string{}, errors.New("/tables endpoint is intentionally disabled for athena, please use /tablesWithConnectionDetails")
}

func (s *AthenaDatasource) TablesWithConnectionDetails(ctx context.Context, region string, catalog string, database string) ([]string, error) {
	// get the api
	api, err := s.getApi(ctx, region, catalog)
	if err != nil {
		return nil, err
	}

	// gets setings with passed in region, catalog, database, replacing __defaults as necessary
	args := &ConnectionArgs{Region: region, Catalog: catalog, Database: database}
	datasourceID := getDatasourceID(ctx)
	defaultSettings, err := s.defaultSettings(datasourceID)
	if err != nil {
		return nil, err
	}
	settings, err := s.athenaSettings(defaultSettings, args)
	if err != nil {
		return nil, err
	}

	// call api with correct settings
	return api.ListTables(ctx, settings.Catalog, settings.Database)
}

// do not use Columns, use ColumnsWithConnectionDetails instead
func (s *AthenaDatasource) Columns(ctx context.Context, table string) ([]string, error) {
	return []string{}, errors.New("/columns endpoint is intentionally disabled for athena, please use /columnsWithConnectionDetails")
}

func (s *AthenaDatasource) ColumnsWithConnectionDetails(ctx context.Context, region string, catalog string, database string, table string) ([]string, error) {
	if table == "" {
		return nil, nil
	}

	api, err := s.getApi(ctx, region, catalog)
	if err != nil {
		return nil, err
	}

	// gets setings with passed in region, catalog, database, replacing defaults as necessary
	args := &ConnectionArgs{Region: region, Catalog: catalog, Database: database}
	datasourceID := getDatasourceID(ctx)
	defaultSettings, err := s.defaultSettings(datasourceID)
	if err != nil {
		return nil, err
	}
	settings, err := s.athenaSettings(defaultSettings, args)
	if err != nil {
		return nil, err
	}

	return api.ListColumnsForTable(ctx, settings.Catalog, settings.Database, table)
}

func getDatasourceID(ctx context.Context) int64 {
	plugin := httpadapter.PluginConfigFromContext(ctx)
	return plugin.DataSourceInstanceSettings.ID
}

func (s *AthenaDatasource) getApi(ctx context.Context, region, catalog string) (*api.API, error) {
	args := &ConnectionArgs{Region: region, Catalog: catalog}
	datasourceID := getDatasourceID(ctx)
	defaultSettings, err := s.defaultSettings(datasourceID)
	if err != nil {
		return nil, err
	}
	settings, err := s.athenaSettings(defaultSettings, args)
	if err != nil {
		return nil, err
	}
	key := s.connectionKey(datasourceID, defaultSettings, args)
	c, exists := s.connections.Load(key)
	if !exists {
		api, err := api.New(s.sessionCache, settings)
		if err != nil {
			return nil, errors.WithMessage(err, "Failed to create athena client")
		}
		return api, nil
	}
	return c.(connection).api, nil
}

func (s *AthenaDatasource) DataCatalogs(ctx context.Context, region string) ([]string, error) {
	api, err := s.getApi(ctx, region, "")
	if err != nil {
		return nil, err
	}
	return api.ListDataCatalogs(ctx)
}

func (s *AthenaDatasource) Databases(ctx context.Context, region, catalog string) ([]string, error) {
	api, err := s.getApi(ctx, region, catalog)
	if err != nil {
		return nil, err
	}
	return api.ListDatabases(ctx, catalog)
}

func (s *AthenaDatasource) Workgroups(ctx context.Context, region string) ([]string, error) {
	api, err := s.getApi(ctx, region, "")
	if err != nil {
		return nil, err
	}
	return api.ListWorkgroups(ctx)
}
