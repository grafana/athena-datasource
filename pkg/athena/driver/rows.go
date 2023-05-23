package driver

import (
	"context"
	"database/sql"
	"fmt"
	"reflect"

	"github.com/aws/aws-sdk-go/service/athena"
	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	drv "github.com/uber/athenadriver/go"
)

type Rows struct {
	*drv.Rows
}

func NewRows(ctx context.Context, athenaAPI athenaiface.AthenaAPI, queryID string) (*Rows, error) {
	config := drv.NewNoOpsConfig()
	config.SetMissingAsNil(true)
	tracer := drv.NewNoOpsObservability()
	rows, err := drv.NewRows(ctx, athenaAPI, queryID, config, tracer)
	if err != nil {
		return nil, err
	}
	return &Rows{rows}, nil
}

// ColumnTypeScanType returns the value type that can be used to scan types into.
// For example, the database column type "bigint" this should return "reflect.TypeOf(int64(0))"
func (r *Rows) ColumnTypeScanType(index int) reflect.Type {
	col := *r.Rows.ResultOutput.ResultSet.ResultSetMetadata.ColumnInfo[index]
	convertedAthenaData, err := r.athenaTypeOf(&col)
	if err != nil {
		log.DefaultLogger.Error(err.Error())
	}
	return convertedAthenaData
}

func (r *Rows) athenaTypeOf(columnInfo *athena.ColumnInfo) (reflect.Type, error) {
	switch *columnInfo.Type {
	case "tinyint", "smallint":
		return reflect.TypeOf(sql.NullInt16{}), nil
	case "integer":
		return reflect.TypeOf(sql.NullInt32{}), nil
	case "bigint":
		return reflect.TypeOf(sql.NullInt64{}), nil
	case "float", "real", "double":
		return reflect.TypeOf(sql.NullFloat64{}), nil
	case "json", "char", "varchar", "varbinary", "row", "string", "binary",
		"struct", "interval year to month", "interval day to second", "decimal",
		"ipaddress", "array", "map", "unknown":
		return reflect.TypeOf(sql.NullString{}), nil
	case "boolean":
		return reflect.TypeOf(sql.NullBool{}), nil
	case "date", "time", "time with time zone", "timestamp", "timestamp with time zone":
		return reflect.TypeOf(sql.NullTime{}), nil
	default:
		return nil, fmt.Errorf("unknown column type `%s`", *columnInfo.Type)
	}
}

func (r *Rows) ColumnTypeNullable(index int) (nullable, ok bool) {
	return true, true
}
