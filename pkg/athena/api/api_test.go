package api

// import (
// 	"context"
// 	"testing"

// 	"github.com/google/go-cmp/cmp"
// 	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/api/mock"
// 	"github.com/grafana/athena-datasource/pkg/athena/models"
// )

// func TestConnection_Execute(t *testing.T) {
// 	expectedID := "foo"
// 	c := NewFake(&athenaclientmock.MockAthenaClient{}, &models.AthenaDataSourceSettings{})
// 	out, err := c.Execute(context.TODO(), expectedID)
// 	if err != nil {
// 		t.Fatalf("unexpected error %v", err)
// 	}
// 	if *out.QueryExecutionId != expectedID {
// 		t.Errorf("unexpected result: %v", cmp.Diff(out.QueryExecutionId, expectedID))
// 	}
// }

// func TestConnection_ListDataCatalogs(t *testing.T) {
// 	expectedCatalogs := []string{"foo"}
// 	c := &API{Client: &athenaclientmock.MockAthenaClient{Catalogs: expectedCatalogs}}
// 	catalogs, err := c.ListDataCatalogs(context.TODO())
// 	if err != nil {
// 		t.Fatalf("unexpected error %v", err)
// 	}
// 	if !cmp.Equal(expectedCatalogs, catalogs) {
// 		t.Errorf("unexpected result: %v", cmp.Diff(expectedCatalogs, catalogs))
// 	}
// }

// func TestConnection_ListDatabases(t *testing.T) {
// 	expected := []string{"foo"}
// 	c := &API{Client: &athenaclientmock.MockAthenaClient{Databases: expected}}
// 	res, err := c.ListDatabases(context.TODO(), "")
// 	if err != nil {
// 		t.Fatalf("unexpected error %v", err)
// 	}
// 	if !cmp.Equal(expected, res) {
// 		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
// 	}
// }

// func TestConnection_ListWorkgroups(t *testing.T) {
// 	expected := []string{"foo"}
// 	c := &API{Client: &athenaclientmock.MockAthenaClient{Workgroups: expected}}
// 	res, err := c.ListWorkgroups(context.TODO())
// 	if err != nil {
// 		t.Fatalf("unexpected error %v", err)
// 	}
// 	if !cmp.Equal(expected, res) {
// 		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
// 	}
// }

// func TestConnection_ListTables(t *testing.T) {
// 	expected := []string{"foo"}
// 	c := &API{Client: &athenaclientmock.MockAthenaClient{TableMetadataList: expected}}
// 	res, err := c.ListTables(context.TODO(), "catalog", "database")
// 	if err != nil {
// 		t.Fatalf("unexpected error %v", err)
// 	}
// 	if !cmp.Equal(expected, res) {
// 		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
// 	}
// }

// func TestConnection_ListColumnsForTable(t *testing.T) {
// 	expected := []string{"foo"}
// 	c := &API{Client: &athenaclientmock.MockAthenaClient{Columns: expected}}
// 	res, err := c.ListColumnsForTable(context.TODO(), "catalog", "database", "table")
// 	if err != nil {
// 		t.Fatalf("unexpected error %v", err)
// 	}
// 	if !cmp.Equal(expected, res) {
// 		t.Errorf("unexpected result: %v", cmp.Diff(expected, res))
// 	}
// }
