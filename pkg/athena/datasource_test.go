package athena

import (
	"context"
	"testing"

	"github.com/grafana/sqlds/v2"
)

func TestConnection_Columns(t *testing.T) {
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
}
