package athena

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"testing"

	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	awsDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver"
	sqlModels "github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sqlds/v2"
	"gotest.tools/assert"
)

type mockClient struct {
	wasCalledWith sqlds.Options
}

func (m *mockClient) Init(config backend.DataSourceInstanceSettings) {}
func (m *mockClient) GetDB(id int64, options sqlds.Options, settingsLoader sqlModels.Loader, apiLoader sqlAPI.Loader, driverLoader awsDriver.Loader) (*sql.DB, error) {
	m.wasCalledWith = options
	return nil, nil
}
func (m *mockClient) GetAPI(id int64, options sqlds.Options, settingsLoader sqlModels.Loader, apiLoader sqlAPI.Loader) (sqlAPI.AWSAPI, error) {
	m.wasCalledWith = options
	return nil, errors.New("fake api error")
}

func TestConnection(t *testing.T) {
	t.Run("it should call getDB with the default region if none is set", func(t *testing.T) {
		mc := mockClient{}
		ds := AthenaDatasource{
			awsDS: &mc,
		}

		fakeConfig := backend.DataSourceInstanceSettings{
			JSONData: json.RawMessage{},
		}
		fakeQueryArgs := json.RawMessage(`{"test": "thing", "region": ""}`)
		_, err := ds.Connect(fakeConfig, fakeQueryArgs)

		if err != nil {
			t.Errorf("unexpected err, %v", err)
		}
		if region, ok := mc.wasCalledWith["region"]; region != "__default" {
			if !ok {
				t.Errorf("no region found")
			} else {
				t.Errorf("unexpected region %v", mc.wasCalledWith["region"])
			}
		}

	})
}

func TestColumns(t *testing.T) {
	t.Run("it should return an empty list if the table is not set", func(t *testing.T) {
		ds := AthenaDatasource{}
		tables, err := ds.Columns(context.TODO(), sqlds.Options{
			"region":   "us-east1",
			"catalog":  "cat",
			"database": "db",
			"table":    "",
		})
		if err != nil {
			t.Errorf("unexpected error %v", err)
		}
		if tables == nil {
			t.Errorf("unexpected null result")
		}
	})

	t.Run("it should call getAPI with the region passed in from args", func(t *testing.T) {
		mc := mockClient{}
		ds := AthenaDatasource{
			awsDS: &mc,
		}
		_, err := ds.Columns(context.TODO(), sqlds.Options{
			"region":   "us-east1",
			"catalog":  "cat",
			"database": "db",
			"table":    "thing",
		})

		assert.Error(t, err, "fake api error", "unexpected error: %v", err)

		if region, ok := mc.wasCalledWith["region"]; region != "us-east1" {
			if !ok {
				t.Errorf("no region found")
			} else {
				t.Errorf("unexpected region %v", mc.wasCalledWith["region"])
			}
		}

	})
}
