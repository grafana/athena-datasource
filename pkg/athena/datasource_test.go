package athena

// import (
// 	"context"
// 	"fmt"
// 	"testing"

// 	"github.com/google/go-cmp/cmp"
// 	"github.com/grafana/athena-datasource/pkg/athena/models"
// 	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
// 	"github.com/grafana/grafana-plugin-sdk-go/backend"
// 	"github.com/grafana/sqlds/v2"
// )

// func TestConnection_athenaSettingsAndKey(t *testing.T) {
// 	defaultRegion := "us-east-1"
// 	defaultCatalog := "foo"
// 	defaultDatabase := "bar"
// 	config := backend.DataSourceInstanceSettings{
// 		JSONData: []byte(fmt.Sprintf(
// 			`{"defaultRegion":"%s","catalog":"%s","database":"%s"}`,
// 			defaultRegion,
// 			defaultCatalog,
// 			defaultDatabase),
// 		),
// 	}
// 	tests := []struct {
// 		description      string
// 		args             *ConnectionArgs
// 		expectedSettings *models.AthenaDataSourceSettings
// 		expectedKey      string
// 	}{
// 		{
// 			description: "it retrieves default settings",
// 			args:        &ConnectionArgs{},
// 			expectedSettings: &models.AthenaDataSourceSettings{
// 				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
// 				Catalog:               defaultCatalog,
// 				Database:              defaultDatabase,
// 			},
// 			expectedKey: fmt.Sprintf("1-%s-%s-%s", models.DefaultKey, models.DefaultKey, models.DefaultKey),
// 		},
// 		{
// 			description: "it should modify the region",
// 			args:        &ConnectionArgs{Region: "other"},
// 			expectedSettings: &models.AthenaDataSourceSettings{
// 				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: "other"},
// 				Catalog:               defaultCatalog,
// 				Database:              defaultDatabase,
// 			},
// 			expectedKey: fmt.Sprintf("1-other-%s-%s", models.DefaultKey, models.DefaultKey),
// 		},
// 		{
// 			description: "it should use the default region",
// 			args:        &ConnectionArgs{Region: models.DefaultKey},
// 			expectedSettings: &models.AthenaDataSourceSettings{
// 				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: defaultRegion},
// 				Catalog:               defaultCatalog,
// 				Database:              defaultDatabase,
// 			},
// 			expectedKey: fmt.Sprintf("1-%s-%s-%s", models.DefaultKey, models.DefaultKey, models.DefaultKey),
// 		},
// 		{
// 			description: "it should modify the catalog",
// 			args:        &ConnectionArgs{Catalog: "other"},
// 			expectedSettings: &models.AthenaDataSourceSettings{
// 				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
// 				Catalog:               "other",
// 				Database:              defaultDatabase,
// 			},
// 			expectedKey: fmt.Sprintf("1-%s-other-%s", models.DefaultKey, models.DefaultKey),
// 		},
// 		{
// 			description: "it should use the default catalog",
// 			args:        &ConnectionArgs{Catalog: models.DefaultKey},
// 			expectedSettings: &models.AthenaDataSourceSettings{
// 				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
// 				Catalog:               defaultCatalog,
// 				Database:              defaultDatabase,
// 			},
// 			expectedKey: fmt.Sprintf("1-%s-%s-%s", models.DefaultKey, models.DefaultKey, models.DefaultKey),
// 		},
// 		{
// 			description: "it should modify the database",
// 			args:        &ConnectionArgs{Database: "other"},
// 			expectedSettings: &models.AthenaDataSourceSettings{
// 				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
// 				Catalog:               defaultCatalog,
// 				Database:              "other",
// 			},
// 			expectedKey: fmt.Sprintf("1-%s-%s-other", models.DefaultKey, models.DefaultKey),
// 		},
// 		{
// 			description: "it should use the default database",
// 			args:        &ConnectionArgs{Database: models.DefaultKey},
// 			expectedSettings: &models.AthenaDataSourceSettings{
// 				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
// 				Catalog:               defaultCatalog,
// 				Database:              defaultDatabase,
// 			},
// 			expectedKey: fmt.Sprintf("1-%s-%s-%s", models.DefaultKey, models.DefaultKey, models.DefaultKey),
// 		},
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.description, func(t *testing.T) {
// 			id := int64(1)
// 			ds := AthenaDatasource{}
// 			ds.config.Store(id, config)
// 			defaultSettings, err := ds.defaultSettings(id)
// 			if err != nil {
// 				t.Fatalf("unexpected error %v", err)
// 			}
// 			settings, err := ds.athenaSettings(defaultSettings, tt.args)
// 			if err != nil {
// 				t.Fatalf("unexpected error %v", err)
// 			}
// 			if !cmp.Equal(settings, tt.expectedSettings) {
// 				t.Errorf("unexpected result: %v", cmp.Diff(settings, tt.expectedSettings))
// 			}
// 			key := ds.connectionKey(id, defaultSettings, tt.args)
// 			if !cmp.Equal(key, tt.expectedKey) {
// 				t.Errorf("unexpected result: %v", cmp.Diff(key, tt.expectedKey))
// 			}
// 		})
// 	}
// }

// func TestConnection_Columns(t *testing.T) {
// 	t.Run("it should return an empty list if the table is not set", func(t *testing.T) {
// 		ds := AthenaDatasource{}
// 		tables, err := ds.Columns(context.TODO(), sqlds.Options{
// 			"region":   "us-east1",
// 			"catalog":  "cat",
// 			"database": "db",
// 			"table":    "",
// 		})
// 		if err != nil {
// 			t.Errorf("unexpected error %v", err)
// 		}
// 		if tables == nil {
// 			t.Errorf("unexpected null result")
// 		}
// 	})
// }
