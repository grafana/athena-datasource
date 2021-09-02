package athena

import (
	"fmt"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestConnection_athenaSettings(t *testing.T) {
	defaultRegion := "us-east-1"
	defaultCatalog := "foo"
	defaultDatabase := "bar"
	config := backend.DataSourceInstanceSettings{
		JSONData: []byte(fmt.Sprintf(
			`{"defaultRegion":"%s","catalog":"%s","database":"%s"}`,
			defaultRegion,
			defaultCatalog,
			defaultDatabase),
		),
	}
	tests := []struct {
		description      string
		args             *ConnectionArgs
		expectedSettings *models.AthenaDataSourceSettings
		expectedKey      string
	}{
		{
			description: "it retrieves default settings",
			args:        &ConnectionArgs{},
			expectedSettings: &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
				Catalog:               defaultCatalog,
				Database:              defaultDatabase,
			},
			expectedKey: "default-default-default",
		},
		{
			description: "it should modify the region",
			args:        &ConnectionArgs{Region: "other"},
			expectedSettings: &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: "other"},
				Catalog:               defaultCatalog,
				Database:              defaultDatabase,
			},
			expectedKey: "other-default-default",
		},
		{
			description: "it should use the default region",
			args:        &ConnectionArgs{Region: "default"},
			expectedSettings: &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: defaultRegion},
				Catalog:               defaultCatalog,
				Database:              defaultDatabase,
			},
			expectedKey: "default-default-default",
		},
		{
			description: "it should modify the catalog",
			args:        &ConnectionArgs{Catalog: "other"},
			expectedSettings: &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
				Catalog:               "other",
				Database:              defaultDatabase,
			},
			expectedKey: "default-other-default",
		},
		{
			description: "it should use the default catalog",
			args:        &ConnectionArgs{Catalog: "default"},
			expectedSettings: &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
				Catalog:               defaultCatalog,
				Database:              defaultDatabase,
			},
			expectedKey: "default-default-default",
		},
		{
			description: "it should modify the database",
			args:        &ConnectionArgs{Database: "other"},
			expectedSettings: &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
				Catalog:               defaultCatalog,
				Database:              "other",
			},
			expectedKey: "default-default-other",
		},
		{
			description: "it should use the default database",
			args:        &ConnectionArgs{Database: "default"},
			expectedSettings: &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
				Catalog:               defaultCatalog,
				Database:              defaultDatabase,
			},
			expectedKey: "default-default-default",
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			ds := AthenaDatasource{config: config}
			settings, key, err := ds.athenaSettings(tt.args)
			if err != nil {
				t.Fatalf("unexpected error %v", err)
			}
			if !cmp.Equal(settings, tt.expectedSettings) {
				t.Errorf("unexpected result: %v", cmp.Diff(settings, tt.expectedSettings))
			}
			if !cmp.Equal(key, tt.expectedKey) {
				t.Errorf("unexpected result: %v", cmp.Diff(key, tt.expectedKey))
			}
		})
	}
}
