package driver

import (
	"context"
	"fmt"
	"testing"
	"time"

	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/driver/mock"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/jpillora/backoff"
	"gotest.tools/assert"
)

func TestConnection_QueryContext(t *testing.T) {
	c := &conn{
		backoffInstance: backoff.Backoff{
			Min: 1 * time.Millisecond,
			Max: 1 * time.Millisecond,
		},
		mockedClient: &athenaclientmock.MockAthenaClient{
			CalledTimesCountDown: 1,
		},
		settings: &models.AthenaDataSourceSettings{
			WorkGroup: "test-Workgroup",
			Database: "test-Database",
		},
	}

	failedOutput, err := c.QueryContext(context.Background(), athenaclientmock.FAKE_ERROR)
	assert.Equal(t, err.Error(), athenaclientmock.FAKE_ERROR)
	assert.Equal(t, failedOutput, nil)

	_, err = c.QueryContext(context.Background(), athenaclientmock.FAKE_SUCCESS)
	assert.Equal(t, err.Error(), nil)
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

	for _, tc := range waitOnQueryTestCases {
		// for tests we override backoff instance to always take 1 millisecond so the tests run quickly
		c := &conn{backoffInstance: backoff.Backoff{
			Min: 1 * time.Millisecond,
			Max: 1 * time.Millisecond,
		}}
		athenaClient := &athenaclientmock.MockAthenaClient{
			CalledTimesCountDown: tc.calledTimesCountDown,
		}
		err := c.waitOnQuery(context.Background(), athenaClient, tc.statementStatus)
		if tc.err != nil || err != nil {
			if err != nil && tc.err == nil {
				t.Fatalf("unexpected error %v", err)
			}
			if err == nil && tc.err != nil {
				t.Fatalf("expecting error %v", tc.err)
			}
			assert.Equal(t, tc.err.Error(), err.Error())
		}
		assert.Equal(t, tc.calledTimesCountDown, athenaClient.CalledTimesCounter)
	}
}
