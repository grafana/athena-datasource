package driver

import (
	"database/sql"
	"database/sql/driver"
	"fmt"
	"sync"

	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
	"github.com/grafana/athena-datasource/pkg/athena/models"
)

const DriverName string = "athena"

var (
	openFromSessionMutex sync.Mutex
	openFromSessionCount int
)

// Driver is a sql.Driver
type Driver struct {
	settings   *models.AthenaDataSourceSettings
	connection *conn
	athenaCli  athenaiface.AthenaAPI
}

// Open returns a new driver.Conn using already existing settings
func (d *Driver) Open(_ string) (driver.Conn, error) {
	d.connection = newConnection(d.athenaCli, d.settings)
	return d.connection, nil
}

func (d *Driver) Closed() bool {
	return d.connection == nil || d.connection.closed
}

// Open registers a new driver with a unique name
func Open(settings *models.AthenaDataSourceSettings, athenaCli athenaiface.AthenaAPI) (*Driver, *sql.DB, error) {
	openFromSessionMutex.Lock()
	openFromSessionCount++
	name := fmt.Sprintf("%s-%d", DriverName, openFromSessionCount)
	openFromSessionMutex.Unlock()
	d := &Driver{settings: settings, athenaCli: athenaCli}
	sql.Register(name, d)
	db, err := sql.Open(name, "")
	return d, db, err
}
