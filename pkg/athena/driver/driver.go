package driver

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"reflect"
	"sync"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	asyncSQLDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver/async"
)

const DriverName string = "athena"

var (
	openFromSessionMutex sync.Mutex
	openFromSessionCount int
)

// Driver is a sql.Driver
type Driver struct {
	name       string
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

func (d *Driver) OpenDB() (*sql.DB, error) {
	return sql.Open(d.name, "")
}

func (d *Driver) GetAsyncDB() (awsds.AsyncDB, error) {
	return d.asyncDB, nil
}

// New registers a new driver with a unique name
func New(_ context.Context, dsAPI sqlAPI.AWSAPI) (asyncSQLDriver.Driver, error) {
	// The API is stored as a generic object but we need to parse it as a Athena API
	if reflect.TypeOf(dsAPI) != reflect.TypeOf(&api.API{}) {
		return nil, fmt.Errorf("wrong API type")
	}
	openFromSessionMutex.Lock()
	openFromSessionCount++
	name := fmt.Sprintf("%s-%d", DriverName, openFromSessionCount)
	openFromSessionMutex.Unlock()
	d := &Driver{api: dsAPI.(*api.API), name: name}
	d.asyncDB = newConnection(d.api)
	d.connection = asyncSQLDriver.NewConnection(d.asyncDB)
	sql.Register(name, d)
	return d, nil
}
