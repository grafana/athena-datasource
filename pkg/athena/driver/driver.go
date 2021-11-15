package driver

import (
	"database/sql"
	"database/sql/driver"
	"fmt"
	"reflect"
	"sync"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	sqlAPI "github.com/grafana/grafana-aws-sdk/pkg/sql/api"
	sqlDriver "github.com/grafana/grafana-aws-sdk/pkg/sql/driver"
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

func (d *Driver) OpenDB() (*sql.DB, error) {
	return sql.Open(d.name, "")
}

// New registers a new driver with a unique name
func New(athenaAPI sqlAPI.AWSAPI) (sqlDriver.Driver, error) {
	// The API is stored as a generic object but we need to parse it as a Athena API
	if reflect.TypeOf(athenaAPI) != reflect.TypeOf(&api.API{}) {
		return nil, fmt.Errorf("wrong API type")
	}
	openFromSessionMutex.Lock()
	openFromSessionCount++
	name := fmt.Sprintf("%s-%d", DriverName, openFromSessionCount)
	openFromSessionMutex.Unlock()
	d := &Driver{api: athenaAPI.(*api.API), name: name}
	sql.Register(name, d)
	return d, nil
}
