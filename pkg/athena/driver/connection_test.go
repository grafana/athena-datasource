package driver

import (
	"context"
	"database/sql/driver"
	"errors"
	"testing"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/api/mock"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	"gotest.tools/assert"
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
	assert.Equal(t, failedOutput, "")

	_, err = c.StartQuery(context.Background(), athenaclientmock.FAKE_SUCCESS, []driver.NamedValue{})
	assert.Equal(t, err, nil)
}
