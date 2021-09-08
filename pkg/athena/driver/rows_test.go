package driver

import (
	"testing"

	"github.com/aws/aws-sdk-go/service/athena"
	drv "github.com/uber/athenadriver/go"
)

func TestColumnTypeScanType(t *testing.T) {
	tests := []struct {
		inputType string
		expected  string
	}{
		{inputType: "tinyint", expected: "int8"},
		{inputType: "smallint", expected: "int16"},
		{inputType: "integer", expected: "int32"},
		{inputType: "bigint", expected: "int64"},
		{inputType: "float", expected: "float32"},
		{inputType: "real", expected: "float32"},
		{inputType: "double", expected: "float64"},
		{inputType: "json", expected: "string"},
		{inputType: "char", expected: "string"},
		{inputType: "varchar", expected: "string"},
		{inputType: "varbinary", expected: "string"},
		{inputType: "row", expected: "string"},
		{inputType: "string", expected: "string"},
		{inputType: "binary", expected: "string"},
		{inputType: "struct", expected: "string"},
		{inputType: "interval year to month", expected: "string"},
		{inputType: "interval day to second", expected: "string"},
		{inputType: "decimal", expected: "string"},
		{inputType: "ipaddress", expected: "string"},
		{inputType: "array", expected: "string"},
		{inputType: "map", expected: "string"},
		{inputType: "unknown", expected: "string"},
		{inputType: "boolean", expected: "bool"},
		{inputType: "json", expected: "string"},
		{inputType: "date", expected: "time.Time"},
		{inputType: "time", expected: "time.Time"},
		{inputType: "time with time zone", expected: "time.Time"},
		{inputType: "timestamp", expected: "time.Time"},
		{inputType: "timestamp with time zone", expected: "time.Time"},
	}
	for _, tt := range tests {
		t.Run(tt.inputType, func(t *testing.T) {
			r := &Rows{
				Rows: &drv.Rows{
					ResultOutput: &athena.GetQueryResultsOutput{
						ResultSet: &athena.ResultSet{
							ResultSetMetadata: &athena.ResultSetMetadata{
								ColumnInfo: []*athena.ColumnInfo{
									{Type: &tt.inputType},
								},
							},
						},
					},
				},
			}
			res := r.ColumnTypeScanType(0)
			if res.String() != tt.expected {
				t.Errorf("unexpected type %s expecting %s", res.String(), tt.expected)
			}
		})
	}
}
