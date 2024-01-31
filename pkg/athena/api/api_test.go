package api

import (
	"context"
	"testing"

	"github.com/google/go-cmp/cmp"
	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/api/mock"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	"github.com/grafana/sqlds/v3"
	"github.com/stretchr/testify/assert"
)

func TestConnection_Execute(t *testing.T) {
	expectedID := "foo"
	c := NewFake(&athenaclientmock.MockAthenaClient{}, &models.AthenaDataSourceSettings{})
	out, err := c.Execute(context.TODO(), &api.ExecuteQueryInput{Query: expectedID})
	assert.Nil(t, err)
	assert.Equal(t, expectedID, out.ID)
}

func TestConnection_Execute_ResultReuseNotEnabledAndMaxAgeInMinutesProvidedDoesNotThrowError(t *testing.T) {
	expectedID := "foo"
	c := NewFake(&athenaclientmock.MockAthenaClient{}, &models.AthenaDataSourceSettings{ResultReuseEnabled: false, ResultReuseMaxAgeInMinutes: 60})
	out, err := c.Execute(context.TODO(), &api.ExecuteQueryInput{Query: expectedID})
	assert.Nil(t, err)
	assert.Equal(t, expectedID, out.ID)
}

func Test_Status(t *testing.T) {
	tests := []struct {
		description          string
		calledTimesCountDown int
		status               string
		finished             bool
	}{
		{
			description:          "success",
			calledTimesCountDown: 1,
			finished:             true,
		},
		{
			description:          "error",
			calledTimesCountDown: 1,
			status:               athenaclientmock.DESCRIBE_STATEMENT_FAILED,
			finished:             true,
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
				},
			}
			status, err := c.Status(context.TODO(), &api.ExecuteQueryOutput{ID: tt.status})
			if err != nil && tt.status == "" {
				t.Errorf("unexpected error %v", err)
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
	catalogs, err := c.DataCatalogs(context.TODO())
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
	res, err := c.Databases(context.TODO(), sqlds.Options{})
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
	res, err := c.Workgroups(context.TODO())
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
	res, err := c.WorkgroupEngineVersion(context.TODO(), sqlds.Options{"workgroup": "workgroup"})
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
	res, err := c.Tables(context.TODO(), sqlds.Options{"catalog": "catalog", "database": "database"})
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
	res, err := c.Columns(context.TODO(), sqlds.Options{
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
