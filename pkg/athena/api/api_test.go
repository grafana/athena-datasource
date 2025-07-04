package api

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/google/go-cmp/cmp"
	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/api/mock"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sqlds/v4"
	"github.com/stretchr/testify/assert"
)

func TestConnection_Execute(t *testing.T) {
	expectedID := "foo"
	c := NewFake(&athenaclientmock.MockAthenaClient{}, &models.AthenaDataSourceSettings{})
	out, err := c.Execute(context.Background(), &api.ExecuteQueryInput{Query: expectedID})
	assert.Nil(t, err)
	assert.Equal(t, expectedID, out.ID)
}

func TestConnection_Execute_ResultReuseNotEnabledAndMaxAgeInMinutesProvidedDoesNotThrowError(t *testing.T) {
	expectedID := "foo"
	c := NewFake(&athenaclientmock.MockAthenaClient{}, &models.AthenaDataSourceSettings{ResultReuseEnabled: false, ResultReuseMaxAgeInMinutes: 60})
	out, err := c.Execute(context.Background(), &api.ExecuteQueryInput{Query: expectedID})
	assert.Nil(t, err)
	assert.Equal(t, expectedID, out.ID)
}

func TestExecute_InternalServerErrorReturnsQueryFailedInternalStatus(t *testing.T) {
	c := NewFake(&athenaclientmock.MockAthenaClient{CalledTimesCountDown: 1}, &models.AthenaDataSourceSettings{})
	_, err := c.Execute(context.Background(), &api.ExecuteQueryInput{Query: athenaclientmock.FAKE_INTERNAL_ERROR})
	assert.NotNil(t, err)
	expectedErr := &awsds.QueryExecutionError{Cause: awsds.QueryFailedInternal, Err: backend.DownstreamError(fmt.Errorf("%w: %v", api.ErrorExecute, athenaclientmock.AthenaInternalServerErrorMock))}
	assert.Equal(t, err, expectedErr)
}

func TestExecute__UserErrorReturnsQueryFailedUserErrorStatus(t *testing.T) {
	c := NewFake(&athenaclientmock.MockAthenaClient{CalledTimesCountDown: 1}, &models.AthenaDataSourceSettings{})
	_, err := c.Execute(context.Background(), &api.ExecuteQueryInput{Query: athenaclientmock.FAKE_USER_ERROR})
	assert.NotNil(t, err)
	expectedErr := &awsds.QueryExecutionError{Cause: awsds.QueryFailedUser, Err: backend.DownstreamError(fmt.Errorf("%w: %v", api.ErrorExecute, athenaclientmock.AthenaUserErrorMock))}
	assert.Equal(t, err, expectedErr)
}

func Test_Status(t *testing.T) {
	tests := []struct {
		description          string
		calledTimesCountDown int
		status               string
		finished             bool
		errorCategory        *int32
		expectedError        error
	}{
		{
			description:          "success",
			calledTimesCountDown: 1,
			finished:             true,
		},
		{
			description:          "error",
			calledTimesCountDown: 1,
			status:               athenaclientmock.UNEXPECTED_ERROR,
			finished:             true,
			expectedError:        backend.DownstreamError(errors.New(athenaclientmock.UNEXPECTED_ERROR)),
		},
		{
			description:          "error",
			calledTimesCountDown: 1,
			status:               athenaclientmock.DESCRIBE_STATEMENT_FAILED,
			finished:             true,
		},
		{
			description:          "error",
			calledTimesCountDown: 1,
			finished:             true,
			status:               athenaclientmock.DESCRIBE_STATEMENT_FAILED,
			errorCategory:        aws.Int32(1),
			expectedError:        &awsds.QueryExecutionError{Cause: awsds.QueryFailedInternal, Err: backend.DownstreamError(errors.New(athenaclientmock.DESCRIBE_STATEMENT_FAILED))},
		},

		{
			description:          "error",
			calledTimesCountDown: 1,
			finished:             true,
			status:               athenaclientmock.DESCRIBE_STATEMENT_FAILED,
			errorCategory:        aws.Int32(2),
			expectedError:        &awsds.QueryExecutionError{Cause: awsds.QueryFailedUser, Err: backend.DownstreamError(errors.New(athenaclientmock.DESCRIBE_STATEMENT_FAILED))},
		},
		{
			description:          "pending",
			calledTimesCountDown: 2,
			finished:             false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			c := &API{
				settings: &models.AthenaDataSourceSettings{},
				Client: &athenaclientmock.MockAthenaClient{
					CalledTimesCountDown: tt.calledTimesCountDown,
					ErrorCategory:        tt.errorCategory,
				}}
			status, err := c.Status(context.Background(), &api.ExecuteQueryOutput{ID: tt.status})
			if err != nil {
				if tt.status == "" {
					t.Errorf("unexpected error %v", err)
				}
				if tt.expectedError != nil {
					assert.Equal(t, err, tt.expectedError)
				}
			}
			if status.Finished != tt.finished {
				t.Errorf("expecting status.Finished to be %v but got %v", tt.finished, status.Finished)
			}
		})
	}
}

func TestConnection_ListDataCatalogs(t *testing.T) {
	expectedCatalogs := []string{"foo"}
	c := &API{Client: &athenaclientmock.MockAthenaClient{Catalogs: expectedCatalogs}}
	catalogs, err := c.DataCatalogs(context.Background())
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}
	if !cmp.Equal(expectedCatalogs, catalogs) {
		t.Errorf("unexpected result: %v", cmp.Diff(expectedCatalogs, catalogs))
	}
}

func TestConnection_ListDatabases(t *testing.T) {
	expected := []string{"foo"}
	c := &API{Client: &athenaclientmock.MockAthenaClient{Databases: expected}}
	res, err := c.Databases(context.Background(), sqlds.Options{})
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}
	if !cmp.Equal(expected, res) {
		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
	}
}

func TestConnection_ListWorkgroups(t *testing.T) {
	expected := []string{"foo"}
	c := &API{Client: &athenaclientmock.MockAthenaClient{Workgroups: expected}}
	res, err := c.Workgroups(context.Background())
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}
	if !cmp.Equal(expected, res) {
		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
	}
}

func TestConnection_GetWorkgroupVersion(t *testing.T) {
	expected := "Athena engine version 3"
	c := &API{Client: &athenaclientmock.MockAthenaClient{WorkgroupEngineVersion: expected}}
	res, err := c.WorkgroupEngineVersion(context.Background(), sqlds.Options{"workgroup": "workgroup"})
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}
	if !cmp.Equal(expected, res) {
		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
	}
}

func TestConnection_ListTables(t *testing.T) {
	expected := []string{"foo"}
	c := &API{Client: &athenaclientmock.MockAthenaClient{TableMetadataList: expected}}
	res, err := c.Tables(context.Background(), sqlds.Options{"catalog": "catalog", "database": "database"})
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}
	if !cmp.Equal(expected, res) {
		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
	}
}

func TestConnection_ListColumnsForTable(t *testing.T) {
	expected := []string{"foo"}
	c := &API{Client: &athenaclientmock.MockAthenaClient{Columns: expected}}
	res, err := c.Columns(context.Background(), sqlds.Options{
		"catalog":  "catalog",
		"database": "database",
		"table":    "table",
	})
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}
	if !cmp.Equal(expected, res) {
		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
	}
}

func Test_WorkgroupEngineSupportsResultReuse(t *testing.T) {
	assert.True(t, workgroupEngineSupportsResultReuse("Athena engine version 3"))
	assert.False(t, workgroupEngineSupportsResultReuse("Athena engine version 2"))
}
