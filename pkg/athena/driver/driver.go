package driver

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"reflect"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	asyncSQLDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver/async"
)

const DriverName string = "athena"

// Driver is a sql.Driver
type Driver struct {
	api        *api.API
	asyncDB    *conn
	connection *asyncSQLDriver.Conn
}

// Open returns a new driver.Conn using already existing settings
func (d *Driver) Open(_ string) (driver.Conn, error) {
	return d.connection, nil
}

func (d *Driver) Closed() bool {
	return d.connection == nil || d.asyncDB.closed
}

// OpenDB keeps d out of the sql driver registry, which never releases a registered driver.
func (d *Driver) OpenDB() (*sql.DB, error) {
	return sql.OpenDB(d), nil
}

// Connect returns the same connection as Open.
func (d *Driver) Connect(_ context.Context) (driver.Conn, error) {
	return d.connection, nil
}

// Driver returns d.
func (d *Driver) Driver() driver.Driver {
	return d
}

func (d *Driver) GetAsyncDB() (awsds.AsyncDB, error) {
	return d.asyncDB, nil
}

// New returns a Driver that uses dsAPI.
func New(_ context.Context, dsAPI sqlAPI.AWSAPI) (asyncSQLDriver.Driver, error) {
	// The API is stored as a generic object but we need to parse it as a Athena API
	if reflect.TypeOf(dsAPI) != reflect.TypeOf(&api.API{}) {
		return nil, fmt.Errorf("wrong API type")
	}
	d := &Driver{api: dsAPI.(*api.API)}
	d.asyncDB = newConnection(d.api)
	d.connection = asyncSQLDriver.NewConnection(d.asyncDB)
	return d, nil
}
