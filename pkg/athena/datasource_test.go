package athena

import (
	"fmt"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestConnection_Connect(t *testing.T) {
	defaultRegion := "us-east-1"
	settings := backend.DataSourceInstanceSettings{
		JSONData: []byte(fmt.Sprintf(`{"defaultRegion": "%s"}`, defaultRegion)),
	}
	tests := []struct {
		description string
		args        []byte
		expected    *models.AthenaDataSourceSettings
	}{
		{
			"it retrieves default settings",
			nil,
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion},
			},
		},
		{
			"it should modify the region",
			[]byte(`{"region":"other"}`),
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: "other"},
			},
		},
		{
			"it should use the default region",
			[]byte(`{"region":"default"}`),
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{DefaultRegion: defaultRegion, Region: defaultRegion},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			res, err := getSettings(settings, tt.args)
			if err != nil {
				t.Fatalf("unexpected error %v", err)
			}
			if !cmp.Equal(res, tt.expected) {
				t.Errorf("unexpected result: %v", cmp.Diff(res, tt.expected))
			}
		})
	}
}

func TestConnection_getRegionKey(t *testing.T) {
	tests := []struct {
		description string
		settings    *models.AthenaDataSourceSettings
		expected    string
	}{
		{
			"undefined region",
			&models.AthenaDataSourceSettings{AWSDatasourceSettings: awsds.AWSDatasourceSettings{}},
			"default",
		},
		{
			"default region",
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "default",
				},
			},
			"default",
		},
		{
			"same region",
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region:        "foo",
					DefaultRegion: "foo",
				},
			},
			"default",
		},
		{
			"different region",
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			"foo",
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			if res := getRegionKey(tt.settings); res != tt.expected {
				t.Errorf("unexpected result %v", res)
			}
		})
	}
}
