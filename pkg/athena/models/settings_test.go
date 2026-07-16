package models

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sqlds/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoad_sessionToken(t *testing.T) {
	s := &AthenaDataSourceSettings{}
	config := backend.DataSourceInstanceSettings{
		JSONData: []byte(`{"authType": "keys", "defaultRegion": "us-east-1"}`),
		DecryptedSecureJSONData: map[string]string{
			"accessKey":    "AKIAIOSFODNN7EXAMPLE",
			"secretKey":    "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
			"sessionToken": "AQoDYXdzEJr//test-session-token",
		},
	}

	err := s.Load(config)
	require.NoError(t, err)
	assert.Equal(t, "AQoDYXdzEJr//test-session-token", s.SessionToken)
}

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

func TestAthenaDataSourceSettings_Load(t *testing.T) {
	tests := []struct {
		name    string
		config  backend.DataSourceInstanceSettings
		want    AthenaDataSourceSettings
		wantErr bool
	}{
		{
			name: "database with lower case",
			config: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{ 
					"database" : "my-lower-db", 
					"OutputLocation": "output-location",
					"workgroup" : "my-wg"
				}`),
			},
			want: AthenaDataSourceSettings{
				Database:       "my-lower-db",
				OutputLocation: "output-location",
				WorkGroup:      "my-wg",
			},
		},
		{
			name: "database field with pascal case",
			config: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{ 
					"Database" : "my-pascal-db", 
					"outputLocation": "output-location",
					"WorkGroup" : "my-wg"
				}`),
			},
			want: AthenaDataSourceSettings{
				Database:       "my-pascal-db",
				OutputLocation: "output-location",
				WorkGroup:      "my-wg",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var s AthenaDataSourceSettings
			gotErr := s.Load(tt.config)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("Load() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("Load() succeeded unexpectedly")
			}
			require.Equal(t, tt.want.Database, s.Database)
			require.Equal(t, tt.want.WorkGroup, s.WorkGroup)
			require.Equal(t, tt.want.OutputLocation, s.OutputLocation)
		})
	}
}
