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
		{inputType: "tinyint", expected: "sql.NullInt16"},
		{inputType: "smallint", expected: "sql.NullInt16"},
		{inputType: "integer", expected: "sql.NullInt32"},
		{inputType: "bigint", expected: "sql.NullInt64"},
		{inputType: "float", expected: "sql.NullFloat64"},
		{inputType: "real", expected: "sql.NullFloat64"},
		{inputType: "double", expected: "sql.NullFloat64"},
		{inputType: "json", expected: "sql.NullString"},
		{inputType: "char", expected: "sql.NullString"},
		{inputType: "varchar", expected: "sql.NullString"},
		{inputType: "varbinary", expected: "sql.NullString"},
		{inputType: "row", expected: "sql.NullString"},
		{inputType: "string", expected: "sql.NullString"},
		{inputType: "binary", expected: "sql.NullString"},
		{inputType: "struct", expected: "sql.NullString"},
		{inputType: "interval year to month", expected: "sql.NullString"},
		{inputType: "interval day to second", expected: "sql.NullString"},
		{inputType: "decimal", expected: "sql.NullString"},
		{inputType: "ipaddress", expected: "sql.NullString"},
		{inputType: "array", expected: "sql.NullString"},
		{inputType: "map", expected: "sql.NullString"},
		{inputType: "unknown", expected: "sql.NullString"},
		{inputType: "boolean", expected: "sql.NullBool"},
		{inputType: "json", expected: "sql.NullString"},
		{inputType: "date", expected: "sql.NullTime"},
		{inputType: "time", expected: "sql.NullTime"},
		{inputType: "time with time zone", expected: "sql.NullTime"},
		{inputType: "timestamp", expected: "sql.NullTime"},
		{inputType: "timestamp with time zone", expected: "sql.NullTime"},
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
