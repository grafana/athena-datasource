package athena

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
)

func TestConnection_applySettings(t *testing.T) {
	defaultRegion := "us-east-1"
	tests := []struct {
		description string
		args        *ConnectionArgs
		expected    *models.AthenaDataSourceSettings
	}{
		{
			"it retrieves default settings",
			&ConnectionArgs{},
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
			},
		},
		{
			"it should modify the region",
			&ConnectionArgs{Region: "other"},
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: "other"},
			},
		},
		{
			"it should use the default region",
			&ConnectionArgs{Region: "default"},
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: defaultRegion},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			defaultSettings := &models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
			}
			res, err := applySettings(defaultSettings, tt.args)
			if err != nil {
				t.Fatalf("unexpected error %v", err)
			}
			if !cmp.Equal(res, tt.expected) {
				t.Errorf("unexpected result: %v", cmp.Diff(res, tt.expected))
			}
		})
	}
}
