package athena

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestConnection_Connect(t *testing.T) {
	tests := []struct {
		description string
		args        []byte
		expected    models.AthenaDataSourceSettings
	}{
		{
			"it retrieve default settings",
			nil,
			models.AthenaDataSourceSettings{},
		},
		{
			"it should modify the region",
			[]byte(`{"region":"other"}`),
			models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{Region: "other"},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			res, err := getSettings(backend.DataSourceInstanceSettings{}, tt.args)
			if err != nil {
				t.Fatalf("unexpected error %v", err)
			}
			if !cmp.Equal(res, tt.expected) {
				t.Errorf("unexpected result: %v", cmp.Diff(res, tt.expected))
			}

		})
	}
}
