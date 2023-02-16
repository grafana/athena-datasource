package fake

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"
)

type AthenaFakeDatasource struct {
	// regions -> catalogs -> databases
	Resources map[string]map[string][]string
	// regions -> workgroups
	Wg              map[string][]string
	WgEngineVersion map[string]string
	ExistingTables  map[string]map[string]map[string][]string
	ExistingColumns map[string]map[string]map[string]map[string][]string
}

func (s *AthenaFakeDatasource) Settings(_ backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{}
}

func (s *AthenaFakeDatasource) Converters() (sc []sqlutil.Converter) {
	return sc
}

func (s *AthenaFakeDatasource) Connect(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (*sql.DB, error) {
	return &sql.DB{}, nil
}

func (s *AthenaFakeDatasource) GetAsyncDB(config backend.DataSourceInstanceSettings, queryArgs json.RawMessage) (awsds.AsyncDB, error) {
	return nil, nil
}

func (s *AthenaFakeDatasource) Macros() sqlds.Macros {
	return sqlds.Macros{}
}

func (s *AthenaFakeDatasource) Regions(ctx context.Context) ([]string, error) {
	return []string{}, nil
}

func (s *AthenaFakeDatasource) CancelQuery(ctx context.Context, options sqlds.Options, queryID string) error {
	return nil
}

func (s *AthenaFakeDatasource) Schemas(ctx context.Context, options sqlds.Options) ([]string, error) {
	return []string{}, nil
}

func (s *AthenaFakeDatasource) DataCatalogs(ctx context.Context, options sqlds.Options) ([]string, error) {
	region := options["region"]
	catalogs := []string{}
	if _, exists := s.Resources[region]; !exists {
		return nil, fmt.Errorf("missing region %s", region)
	}
	for cat := range s.Resources[region] {
		catalogs = append(catalogs, cat)
	}
	return catalogs, nil
}

func (s *AthenaFakeDatasource) Databases(ctx context.Context, options sqlds.Options) ([]string, error) {
	region, catalog := options["region"], options["catalog"]
	if _, exists := s.Resources[region]; !exists {
		return nil, fmt.Errorf("missing region %s", region)
	}
	if _, exists := s.Resources[region][catalog]; !exists {
		return nil, fmt.Errorf("missing catalog %s", catalog)
	}
	return s.Resources[region][catalog], nil
}

func (s *AthenaFakeDatasource) Workgroups(ctx context.Context, options sqlds.Options) ([]string, error) {
	region := options["region"]
	if _, exists := s.Wg[region]; !exists {
		return nil, fmt.Errorf("missing region %s", region)
	}
	return s.Wg[region], nil
}

func (s *AthenaFakeDatasource) WorkgroupEngineVersion(ctx context.Context, options sqlds.Options) (string, error) {
	workgroup := options["workgroup"]
	if _, exists := s.WgEngineVersion[workgroup]; !exists {
		return "", fmt.Errorf("missing workgroup %s", workgroup)
	}
	return s.WgEngineVersion[workgroup], nil
}

func (s *AthenaFakeDatasource) Tables(ctx context.Context, options sqlds.Options) ([]string, error) {
	region, catalog, database := options["region"], options["catalog"], options["database"]
	return s.ExistingTables[region][catalog][database], nil
}

func (s *AthenaFakeDatasource) Columns(ctx context.Context, options sqlds.Options) ([]string, error) {
	region, catalog, database, table := options["region"], options["catalog"], options["database"], options["table"]
	return s.ExistingColumns[region][catalog][database][table], nil
}
