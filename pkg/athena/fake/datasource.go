package fake

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"
)

type AthenaFakeDatasource struct {
	// regions -> catalogs -> databases
	Resources map[string]map[string][]string
	// regions -> workgroups
	Wg map[string][]string
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

func (s *AthenaFakeDatasource) Macros() sqlds.Macros {
	return sqlds.Macros{}
}

func (s *AthenaFakeDatasource) DataCatalogs(ctx context.Context, region string) ([]string, error) {
	catalogs := []string{}
	if _, exists := s.Resources[region]; !exists {
		return nil, fmt.Errorf("missing region %s", region)
	}
	for cat := range s.Resources[region] {
		catalogs = append(catalogs, cat)
	}
	return catalogs, nil
}

func (s *AthenaFakeDatasource) Databases(ctx context.Context, region, catalog string) ([]string, error) {
	if _, exists := s.Resources[region]; !exists {
		return nil, fmt.Errorf("missing region %s", region)
	}
	if _, exists := s.Resources[region][catalog]; !exists {
		return nil, fmt.Errorf("missing catalog %s", catalog)
	}
	return s.Resources[region][catalog], nil
}

func (s *AthenaFakeDatasource) Workgroups(ctx context.Context, region string) ([]string, error) {
	if _, exists := s.Wg[region]; !exists {
		return nil, fmt.Errorf("missing region %s", region)
	}
	return s.Wg[region], nil
}
