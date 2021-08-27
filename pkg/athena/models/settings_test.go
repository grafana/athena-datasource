package models

import (
	"testing"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
)

func TestConnection_getRegionKey(t *testing.T) {
	tests := []struct {
		description string
		settings    *AthenaDataSourceSettings
		region      string
		catalog     string
		expected    string
	}{
		{
			"undefined region",
			&AthenaDataSourceSettings{AWSDatasourceSettings: awsds.AWSDatasourceSettings{}},
			"",
			"",
			"default-default",
		},
		{
			"default region",
			&AthenaDataSourceSettings{AWSDatasourceSettings: awsds.AWSDatasourceSettings{}},
			"default",
			"",
			"default-default",
		},
		{
			"same region",
			&AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					DefaultRegion: "foo",
				},
			},
			"foo",
			"",
			"default-default",
		},
		{
			"different region",
			&AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			"foo",
			"",
			"foo-default",
		},
		{
			"different catalog",
			&AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			"",
			"foo",
			"default-foo",
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			if res := tt.settings.GetConnectionKey(tt.region, tt.catalog); res != tt.expected {
				t.Errorf("unexpected result %v", res)
			}
		})
	}
}
