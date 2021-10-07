package driver

import (
	"context"
	"database/sql/driver"
	"errors"
	"fmt"
	"testing"
	"time"

	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/api/mock"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"gotest.tools/assert"
)

func TestConnection_QueryContext(t *testing.T) {
	c := &conn{
		settings: &models.AthenaDataSourceSettings{
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{},
			Database:              "test-Database",
			Catalog:               "",
			WorkGroup:             "test-Workgroup",
		},
		athenaCli: &athenaclientmock.MockAthenaClient{CalledTimesCountDown: 1},
	}

	failedOutput, err := c.QueryContext(context.Background(), athenaclientmock.FAKE_ERROR, []driver.NamedValue{})
	assert.Equal(t, err.Error(), athenaclientmock.FAKE_ERROR)
	assert.Equal(t, failedOutput, nil)

	_, err = c.QueryContext(context.Background(), athenaclientmock.FAKE_SUCCESS, []driver.NamedValue{})
	assert.Equal(t, err, nil)
}

var waitOnQueryTestCases = []struct {
	calledTimesCountDown int
	statementStatus      string
	err                  error
}{
	{1, athenaclientmock.DESCRIBE_STATEMENT_SUCCEEDED, nil},
	{10, athenaclientmock.DESCRIBE_STATEMENT_SUCCEEDED, nil},
	{1, athenaclientmock.DESCRIBE_STATEMENT_FAILED, fmt.Errorf(athenaclientmock.DESCRIBE_STATEMENT_FAILED)},
	{10, athenaclientmock.DESCRIBE_STATEMENT_FAILED, fmt.Errorf(athenaclientmock.DESCRIBE_STATEMENT_FAILED)},
}

func TestConnection_waitOnQuery(t *testing.T) {
	t.Parallel()
	backoffMin = 1 * time.Millisecond
	backoffMax = 1 * time.Millisecond

	for _, tc := range waitOnQueryTestCases {
		// for tests we override backoff instance to always take 1 millisecond so the tests run quickly
		cliMock := &athenaclientmock.MockAthenaClient{
			CalledTimesCountDown: tc.calledTimesCountDown,
		}
		c := &conn{
			athenaCli: cliMock,
		}
		err := c.waitOnQuery(context.Background(), tc.statementStatus)
		if tc.err != nil || err != nil {
			if err != nil && tc.err == nil {
				t.Fatalf("unexpected error %v", err)
			}
			if err == nil && tc.err != nil {
				t.Fatalf("expecting error %v", tc.err)
			}
			assert.Equal(t, tc.err.Error(), err.Error())
		}
		assert.Equal(t, tc.calledTimesCountDown, cliMock.CalledTimesCounter)
	}
}

func TestConnection_waitOnQueryCancelled(t *testing.T) {
	// add a big timeout to have time to cancel
	backoffMin = 10000 * time.Millisecond
	backoffMax = 10000 * time.Millisecond

	cliMock := &athenaclientmock.MockAthenaClient{
		CalledTimesCountDown: 5,
	}
	c := &conn{
		athenaCli: cliMock,
	}

	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	done := make(chan bool)

	// start the execution in parallel
	go func() {
		err := c.waitOnQuery(ctx, "foo")
		if err == nil || !errors.Is(err, context.Canceled) {
			t.Errorf("unexpected error %v", err)
		}
		done <- true
	}()
	cancel()
	<-done

	if !cliMock.Cancelled {
		t.Errorf("failed to cancel the request")
	}
}
