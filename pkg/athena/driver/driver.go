package driver

import (
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
	settings *models.AthenaDataSourceSettings
}

// Open returns a new driver.Conn using already existing settings
func (d *Driver) Open(_ string) (driver.Conn, error) {
	return newConnection(awsds.NewSessionCache(), d.settings), nil
}

// Open registers a new driver with a unique name
func Open(settings models.AthenaDataSourceSettings) (*sql.DB, error) {
	openFromSessionMutex.Lock()
	openFromSessionCount++
	name := fmt.Sprintf("%s-%d", DriverName, openFromSessionCount)
	openFromSessionMutex.Unlock()
	sql.Register(name, &Driver{&settings})
	return sql.Open(name, "")
}
