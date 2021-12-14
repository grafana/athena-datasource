package driver

import (
	"database/sql"
	"database/sql/driver"
	"fmt"
	"reflect"
	"sync"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
)

const DriverName string = "athena"

var (
	openFromSessionMutex sync.Mutex
	openFromSessionCount int
)

// Driver is a sql.Driver
type Driver struct {
	api        *api.API
	connection *conn
}

// Open returns a new driver.Conn using already existing settings
func (d *Driver) Open(_ string) (driver.Conn, error) {
	d.connection = newConnection(d.api)
	return d.connection, nil
}

func (d *Driver) Closed() bool {
	return d.connection == nil || d.connection.closed
}

// Open registers a new driver with a unique name
func Open(dsAPI sqlAPI.AWSAPI) (*Driver, *sql.DB, error) {
	// The API is stored as a generic object but we need to parse it as a Athena API
	if reflect.TypeOf(dsAPI) != reflect.TypeOf(&api.API{}) {
		return nil, nil, fmt.Errorf("wrong API type")
	}
	openFromSessionMutex.Lock()
	openFromSessionCount++
	name := fmt.Sprintf("%s-%d", DriverName, openFromSessionCount)
	openFromSessionMutex.Unlock()
	d := &Driver{api: dsAPI.(*api.API)}
	sql.Register(name, d)
	db, err := sql.Open(name, "")
	return d, db, err
}
