package models

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/sqlds/v2"
)

func TestConnection_getRegionKey(t *testing.T) {
	tests := []struct {
		description string
		settings    *AthenaDataSourceSettings
		options     sqlds.Options
		expected    AthenaDataSourceSettings
	}{
		{
			description: "undefined region",
			settings:    &AthenaDataSourceSettings{AWSDatasourceSettings: awsds.AWSDatasourceSettings{}},
			expected:    AthenaDataSourceSettings{},
		},
		{
			description: "default region",
			settings:    &AthenaDataSourceSettings{AWSDatasourceSettings: awsds.AWSDatasourceSettings{}},
			options:     sqlds.Options{"region": models.DefaultKey},
			expected:    AthenaDataSourceSettings{},
		},
		{
			description: "same region",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					DefaultRegion: "foo",
				},
			},
			options: sqlds.Options{"region": "foo"},
			expected: AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					DefaultRegion: "foo",
					Region:        "foo",
				},
			},
		},
		{
			description: "different region",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			options: sqlds.Options{"region": "foo"},
			expected: AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
		},
		{
			description: "different catalog",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			options: sqlds.Options{"catalog": "foo"},
			expected: AthenaDataSourceSettings{
				Catalog: "foo",
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
		},
		{
			description: "different database",
			settings: &AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
			options: sqlds.Options{"database": "foo"},
			expected: AthenaDataSourceSettings{
				Database: "foo",
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{
					Region: "foo",
				},
			},
		},
		{
			description: "undefined result reuse",
			settings:    &AthenaDataSourceSettings{},
			options:     sqlds.Options{},
			expected: AthenaDataSourceSettings{
				ResultReuseEnabled: false,
			},
		},
		{
			description: "result reuse enabled and max age value set",
			settings:    &AthenaDataSourceSettings{},
			options:     sqlds.Options{"resultReuseEnabled": "true", "resultReuseMaxAgeInMinutes": "10"},
			expected: AthenaDataSourceSettings{
				ResultReuseEnabled:         true,
				ResultReuseMaxAgeInMinutes: 10,
			},
		},
		{
			description: "result reuse options set to unknown values",
			settings:    &AthenaDataSourceSettings{},
			options:     sqlds.Options{"resultReuseEnabled": "true_blah_blah", "resultReuseMaxAgeInMinutes": "10_not_a_number"},
			expected: AthenaDataSourceSettings{
				ResultReuseEnabled: false,
			},
		},
		{
			description: "result reuse is disabled and max age value is set",
			settings:    &AthenaDataSourceSettings{},
			options:     sqlds.Options{"resultReuseEnabled": "false", "resultReuseMaxAgeInMinutes": "10"},
			expected: AthenaDataSourceSettings{
				ResultReuseEnabled: false,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			tt.settings.Apply(tt.options)
			if !cmp.Equal(*tt.settings, tt.expected) {
				t.Errorf("unexpected result %v", cmp.Diff(*tt.settings, tt.expected))
			}
		})
	}
}
