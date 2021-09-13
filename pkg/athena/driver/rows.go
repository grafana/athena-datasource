package driver

import (
	"context"
	"fmt"
	"reflect"
	"time"

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
	case "tinyint":
		return reflect.TypeOf(int8(0)), nil
	case "smallint":
		return reflect.TypeOf(int16(0)), nil
	case "integer":
		return reflect.TypeOf(int32(0)), nil
	case "bigint":
		return reflect.TypeOf(int64(0)), nil
	case "float", "real":
		return reflect.TypeOf(float32(0)), nil
	case "double":
		return reflect.TypeOf(float64(0)), nil
	case "json", "char", "varchar", "varbinary", "row", "string", "binary",
		"struct", "interval year to month", "interval day to second", "decimal",
		"ipaddress", "array", "map", "unknown":
		return reflect.TypeOf(""), nil
	case "boolean":
		return reflect.TypeOf(false), nil
	case "date", "time", "time with time zone", "timestamp", "timestamp with time zone":
		return reflect.TypeOf(time.Time{}), nil
	default:
		return nil, fmt.Errorf("unknown column type `%s`", *columnInfo.Type)
	}
}
