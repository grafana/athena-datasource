package athena

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/grafana/athena-datasource/pkg/athena/driver"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"
	"github.com/pkg/errors"
)

type connection struct {
	db     *sql.DB
	driver *driver.Driver
}

type AthenaDatasource struct {
	c map[string]connection
}

type ConnectionArgs struct {
	Region string `json:"region,omitempty"`
}

func New() *AthenaDatasource {
	return &AthenaDatasource{c: map[string]connection{}}
}

func (s *AthenaDatasource) Settings(_ backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{
		FillMode: &data.FillMissing{
			Mode: data.FillModeNull,
		},
	}
}

func getSettings(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (*models.AthenaDataSourceSettings, error) {
	settings := &models.AthenaDataSourceSettings{}
	err := settings.Load(config)
	if err != nil {
		return nil, fmt.Errorf("error reading settings: %s", err.Error())
	}

	if queryArgs != nil {
		args := &ConnectionArgs{}
		err = json.Unmarshal(queryArgs, args)
		if err != nil {
			return nil, fmt.Errorf("error reading query params: %s", err.Error())
		}
		if args.Region != "" {
			if args.Region == "default" {
				settings.Region = settings.DefaultRegion
			} else {
				settings.Region = args.Region
			}
		}
	}

	return settings, nil
}

func getRegionKey(settings *models.AthenaDataSourceSettings) string {
	if settings.Region == "" || settings.Region == "default" || settings.Region == settings.DefaultRegion {
		return "default"
	}
	return settings.Region
}

// Connect opens a sql.DB connection using datasource settings
func (s *AthenaDatasource) Connect(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (*sql.DB, error) {
	settings, err := getSettings(config, queryArgs)
	if err != nil {
		return nil, errors.WithMessage(err, "Failed to parse settings")
	}

	// avoid to create a new connection if the arguments have not changed
	key := getRegionKey(settings)
	c, exists := s.c[key]
	if exists && !c.driver.Closed() {
		return c.db, nil
	}

	dr, db, err := driver.Open(*settings)
	if err != nil {
		return nil, errors.WithMessage(err, "Failed to connect to database. Is the hostname and port correct?")
	}
	s.c[key] = connection{driver: dr, db: db}
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
	c, exists := s.c[region]
	if !exists {
		return nil, fmt.Errorf("missing connection")
	}
	return c.driver.ListDataCatalogsWithContext(ctx)
}
