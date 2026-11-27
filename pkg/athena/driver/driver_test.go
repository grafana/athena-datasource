package driver

import (
	"database/sql"
	"testing"

	"github.com/grafana/athena-datasource/pkg/athena/api"
	"github.com/stretchr/testify/require"
)

func TestNew_DoesNotRegisterDrivers(t *testing.T) {
	before := len(sql.Drivers())
	for range 10 {
		_, err := New(t.Context(), &api.API{})
		require.NoError(t, err)
	}
	require.Len(t, sql.Drivers(), before)
}

func TestOpenDB_UsesDriverConnection(t *testing.T) {
	dr, err := New(t.Context(), &api.API{})
	require.NoError(t, err)
	d, ok := dr.(*Driver)
	require.True(t, ok)

	db, err := d.OpenDB()
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })
	require.Same(t, d, db.Driver())

	conn, err := db.Conn(t.Context())
	require.NoError(t, err)
	t.Cleanup(func() { _ = conn.Close() })

	var raw any
	require.NoError(t, conn.Raw(func(c any) error {
		raw = c
		return nil
	}))
	require.Same(t, d.connection, raw)
}
