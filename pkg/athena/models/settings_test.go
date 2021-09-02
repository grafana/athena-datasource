package models

import (
	"fmt"
	"testing"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
)

func TestConnection_getRegionKey(t *testing.T) {
	tests := []struct {
		description string
		settings    *AthenaDataSourceSettings
		region      string
		catalog     string
		database    string
		expected    string
	}{
		{
			description: "undefined region",
			settings:    &AthenaDataSourceSettings{AWSDatasourceSettings: awsds.AWSDatasourceSettings{}},
			expected:    fmt.Sprintf("1-%s-%s-%s", DefaultKey, DefaultKey, DefaultKey),
		},
		{
			description: "default region",
			settings:    &AthenaDataSourceSettings{AWSDatasourceSettings: awsds.AWSDatasourceSettings{}},
			region:      DefaultKey,
			expected:    fmt.Sprintf("1-%s-%s-%s", DefaultKey, DefaultKey, DefaultKey),
		},
		{
			description: "same region",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					DefaultRegion: "foo",
				},
			},
			region:   "foo",
			expected: fmt.Sprintf("1-%s-%s-%s", DefaultKey, DefaultKey, DefaultKey),
		},
		{
			description: "different region",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			region:   "foo",
			expected: fmt.Sprintf("1-foo-%s-%s", DefaultKey, DefaultKey),
		},
		{
			description: "different catalog",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			catalog:  "foo",
			expected: fmt.Sprintf("1-%s-foo-%s", DefaultKey, DefaultKey),
		},
		{
			description: "different database",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			database: "foo",
			expected: fmt.Sprintf("1-%s-%s-foo", DefaultKey, DefaultKey),
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			if res := tt.settings.GetConnectionKey(1, tt.region, tt.catalog, tt.database); res != tt.expected {
				t.Errorf("unexpected result %v expecting %v", res, tt.expected)
			}
		})
	}
}
