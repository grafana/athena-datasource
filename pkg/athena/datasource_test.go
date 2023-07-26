package athena

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	awsDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver"
	asyncDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver/async"
	sqlModels "github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sqlds/v2"
	"github.com/stretchr/testify/assert"
)

type mockClient struct {
	wasCalledWith sqlds.Options
}

func (m *mockClient) Init(config backend.DataSourceInstanceSettings) {}
func (m *mockClient) GetDB(id int64, options sqlds.Options, settingsLoader sqlModels.Loader, apiLoader sqlAPI.Loader, driverLoader awsDriver.Loader) (*sql.DB, error) {
	m.wasCalledWith = options
	return nil, nil
}
func (m *mockClient) GetAsyncDB(id int64, options sqlds.Options, settingsLoader sqlModels.Loader, apiLoader sqlAPI.Loader, driverLoader asyncDriver.Loader) (awsds.AsyncDB, error) {
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

		updatedTime := time.Now()
		fakeConfig := backend.DataSourceInstanceSettings{
			JSONData: json.RawMessage{},
			Updated:  updatedTime,
		}
		fakeQueryArgs := json.RawMessage(`{"test": "thing", "region": ""}`)
		_, err := ds.Connect(fakeConfig, fakeQueryArgs)

		assert.Nil(t, err)
		assert.Equal(t, "__default", mc.wasCalledWith["region"])
		assert.Equal(t, updatedTime.String(), mc.wasCalledWith["updated"])
	})

	t.Run("it should call getAsyncDB with the default region if none is set", func(t *testing.T) {
		mc := mockClient{}
		ds := AthenaDatasource{
			awsDS: &mc,
		}

		updatedTime := time.Now()
		fakeConfig := backend.DataSourceInstanceSettings{
			JSONData: json.RawMessage{},
			Updated:  updatedTime,
		}
		fakeQueryArgs := json.RawMessage(`{"test": "thing", "region": ""}`)
		_, err := ds.GetAsyncDB(fakeConfig, fakeQueryArgs)

		assert.Nil(t, err)
		assert.Equal(t, "__default", mc.wasCalledWith["region"])
		assert.Equal(t, updatedTime.String(), mc.wasCalledWith["updated"])
	})

	t.Run("it should call getAsyncDB with the resultReuseEnabled option if one is provided", func(t *testing.T) {
		mc := mockClient{}
		ds := AthenaDatasource{
			awsDS: &mc,
		}

		fakeConfig := backend.DataSourceInstanceSettings{
			JSONData: json.RawMessage{},
		}
		fakeQueryArgs := json.RawMessage(`{"resultReuseEnabled": true}`)
		_, err := ds.GetAsyncDB(fakeConfig, fakeQueryArgs)

		assert.Nil(t, err)
		assert.Equal(t, "true", mc.wasCalledWith["resultReuseEnabled"])
	})

	t.Run("it should call getAsyncDB with the resultReuseMaxAgeInMinutes option if one is provided", func(t *testing.T) {
		mc := mockClient{}
		ds := AthenaDatasource{
			awsDS: &mc,
		}

		fakeConfig := backend.DataSourceInstanceSettings{
			JSONData: json.RawMessage{},
		}
		fakeQueryArgs := json.RawMessage(`{"resultReuseMaxAgeInMinutes": 10}`)
		_, err := ds.GetAsyncDB(fakeConfig, fakeQueryArgs)

		assert.Nil(t, err)
		assert.Equal(t, "10", mc.wasCalledWith["resultReuseMaxAgeInMinutes"])
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
		assert.Nil(t, err)
		assert.NotNil(t, tables)
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
		assert.Equal(t, "us-east1", mc.wasCalledWith["region"])
		// We can not set the config in the context, but we can confirm that updated is being added
		assert.Equal(t, "", mc.wasCalledWith["updated"])
	})
}
