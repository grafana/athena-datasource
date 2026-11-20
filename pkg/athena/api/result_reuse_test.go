package api

import (
	"context"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/athena"
	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/api/mock"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type capturingClient struct {
	athenaclientmock.MockAthenaClient
	input *athena.StartQueryExecutionInput
}

func (c *capturingClient) StartQueryExecution(ctx context.Context, in *athena.StartQueryExecutionInput, opts ...func(*athena.Options)) (*athena.StartQueryExecutionOutput, error) {
	c.input = in
	return c.MockAthenaClient.StartQueryExecution(ctx, in, opts...)
}

func TestExecute_ResultReuseMaxAge(t *testing.T) {
	tests := []struct {
		name     string
		settings models.AthenaDataSourceSettings
		// nil means MaxAgeInMinutes must be left unset so Athena applies its default
		expectedMaxAge *int32
		expectedEnable bool
	}{
		{
			name:           "max age is passed through",
			settings:       models.AthenaDataSourceSettings{ResultReuseEnabled: true, ResultReuseMaxAgeInMinutes: 30},
			expectedMaxAge: func() *int32 { v := int32(30); return &v }(),
			expectedEnable: true,
		},
		{
			name:           "enabled without max age leaves it unset",
			settings:       models.AthenaDataSourceSettings{ResultReuseEnabled: true},
			expectedEnable: true,
		},
		{
			name:     "disabled without max age leaves it unset",
			settings: models.AthenaDataSourceSettings{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &capturingClient{MockAthenaClient: athenaclientmock.MockAthenaClient{WorkgroupEngineVersion: "Athena engine version 3"}}
			settings := tt.settings
			_, err := NewFake(client, &settings).Execute(context.Background(), &api.ExecuteQueryInput{Query: "SELECT 1"})
			require.NoError(t, err)
			require.NotNil(t, client.input.ResultReuseConfiguration)
			cfg := client.input.ResultReuseConfiguration.ResultReuseByAgeConfiguration
			assert.Equal(t, tt.expectedEnable, cfg.Enabled)
			assert.Equal(t, tt.expectedMaxAge, cfg.MaxAgeInMinutes)
		})
	}
}
