package driver

import (
	"context"
	"database/sql/driver"
	"errors"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/athena"
	"github.com/grafana/athena-datasource/pkg/athena/api"
	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/api/mock"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	"github.com/stretchr/testify/assert"
)

func TestConnection_QueryContext(t *testing.T) {
	c := &conn{
		api: api.NewFake(&athenaclientmock.MockAthenaClient{CalledTimesCountDown: 1},
			&models.AthenaDataSourceSettings{
				AWSDatasourceSettings: awsds.AWSDatasourceSettings{},
				Database:              "test-Database",
				Catalog:               "",
				WorkGroup:             "test-Workgroup",
			}),
	}

	failedOutput, err := c.StartQuery(context.Background(), athenaclientmock.FAKE_ERROR, []driver.NamedValue{})
	if !errors.Is(err, sqlAPI.ErrorExecute) {
		t.Errorf("unexpected err %v", err)
	}
	assert.Equal(t, "", failedOutput)

	_, err = c.StartQuery(context.Background(), athenaclientmock.FAKE_SUCCESS, []driver.NamedValue{})
	assert.NoError(t, err)
}

type ctxKey struct{}

// ctxSpyClient records the context StopQueryExecution is called with.
type ctxSpyClient struct {
	athenaclientmock.MockAthenaClient
	stopCtx context.Context
}

func (c *ctxSpyClient) StopQueryExecution(ctx context.Context, in *athena.StopQueryExecutionInput, _ ...func(*athena.Options)) (*athena.StopQueryExecutionOutput, error) {
	c.stopCtx = ctx
	return &athena.StopQueryExecutionOutput{}, nil
}

func TestConnection_CancelQueryUsesRequestContext(t *testing.T) {
	spy := &ctxSpyClient{}
	c := &conn{api: api.NewFake(spy, &models.AthenaDataSourceSettings{})}

	ctx := context.WithValue(context.Background(), ctxKey{}, "request")
	assert.NoError(t, c.CancelQuery(ctx, "q-1"))
	if assert.NotNil(t, spy.stopCtx) {
		assert.Equal(t, "request", spy.stopCtx.Value(ctxKey{}), "cancel must carry the request context (and its user)")
	}
}
