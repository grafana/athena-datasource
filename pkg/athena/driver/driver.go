package driver

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"sync"

	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
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
}

func (d *Driver) connect() *conn {
	if d.connection == nil {
		c := newConnection(awsds.NewSessionCache(), d.settings)
		d.connection = c
	}
	return d.connection
}

// Open returns a new driver.Conn using already existing settings
func (d *Driver) Open(_ string) (driver.Conn, error) {
	return d.connect(), nil
}

func (d *Driver) Closed() bool {
	return d.connection.closed
}

func (d *Driver) ListDataCatalogsWithContext(ctx context.Context) ([]string, error) {
	if d.connection == nil {
		return nil, fmt.Errorf("missing connection")
	}
	return d.connection.ListDataCatalogs(ctx)
}

// Open registers a new driver with a unique name
func Open(settings models.AthenaDataSourceSettings) (*Driver, *sql.DB, error) {
	openFromSessionMutex.Lock()
	openFromSessionCount++
	name := fmt.Sprintf("%s-%d", DriverName, openFromSessionCount)
	openFromSessionMutex.Unlock()
	d := &Driver{&settings, nil}
	d.connect()
	sql.Register(name, d)
	db, err := sql.Open(name, "")
	return d, db, err
}
