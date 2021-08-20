package driver

import (
	"database/sql/driver"
	"fmt"
	"io"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/athena"
	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
)

/*
	A general note regarding this Rows driver:
	Large pieces of this file were heavily inspired by Uber's Athena Driver implementation
	which they open sourced, you can checkout it out at https://github.dev/uber/athenadriver
*/
type Rows struct {
	client  athenaiface.AthenaAPI
	queryID string
	result *athena.GetQueryResultsOutput
	pageCount       int64
	doneLoading bool
}

func newRows(client athenaiface.AthenaAPI, queryId string) (*Rows, error) {
	r := Rows{
		client:  client,
		queryID: queryId,
	}

	if err := r.fetchNextPage(nil); err != nil {
		return nil, err
	}
	
	return &r, nil
}

// Next is called to populate the next row of data into
// the provided slice. The provided slice will be the same
// size as the Columns() are wide. io.EOF should be returned when there are no more rows.
func (r *Rows) Next(dest []driver.Value) error {
	// If there are no rows either because 
	// - it's the first time around and we haven't fetched them yet
	// - or because we've already converted all of the rows into a format we understand and need the next page
	if len(r.result.ResultSet.Rows) == 0 {
		// if nothing more to paginate then we're done
		if r.result.NextToken == nil || *r.result.NextToken == "" {
			r.doneLoading = true
			return io.EOF
		}

		// otherwise, get the next page of rows
		err := r.fetchNextPage(r.result.NextToken)
		if err != nil {
			return err
		}
	}

	// get the first row and convert it from strings into to a more meaningful format
	current := r.result.ResultSet.Rows[0].Data
	if err := r.convertRow(r.result.ResultSet.ResultSetMetadata.ColumnInfo, current, dest); err != nil {
		return err
	}

	// remove the first row of data as it's been appropriately formatted and now lives in Driver.value
	r.result.ResultSet.Rows = r.result.ResultSet.Rows[1:]
	return nil
}

// Columns returns the names of the columns.
func (r *Rows) Columns() []string {
	columnNames := []string{}
	for _, column := range r.result.ResultSet.ResultSetMetadata.ColumnInfo {
		columnNames = append(columnNames, *column.Name)
	}
	return columnNames
}

// ColumnTypeNullable returns true if it is known the column may be null,
// or false if the column is known to be not nullable. If the column nullability is unknown, ok should be false.
func (r *Rows) ColumnTypeNullable(index int) (nullable, ok bool) {
	col := *r.result.ResultSet.ResultSetMetadata.ColumnInfo[index]

	if *col.Nullable == "NULLABLE" {
		return true, true
	}

	return false, true
}

// ColumnTypeScanType returns the value type that can be used to scan types into.
// For example, the database column type "bigint" this should return "reflect.TypeOf(int64(0))"
func (r *Rows) ColumnTypeScanType(index int) reflect.Type {
	col := *r.result.ResultSet.ResultSetMetadata.ColumnInfo[index]
	val := *r.result.ResultSet.Rows[0].Data[index]
	convertedAthenaData, err := r.convertValueFromAthena(&col, val.VarCharValue)
	// TODO: is this error handling sufficient?
	if err != nil {
		return nil
	}
	return reflect.TypeOf(convertedAthenaData)
}

// ColumnTypeDatabaseTypeName returns the type of the column
func (r *Rows) ColumnTypeDatabaseTypeName(index int) string {
	colInfo := r.result.ResultSet.ResultSetMetadata.ColumnInfo[index]
	if colInfo.Type != nil {
		return *colInfo.Type
	}
	return ""
}

// Closes the rows iterator.
func (r *Rows) Close() error {
	r.doneLoading = true
	return nil
}

// FetchNextPage:
// - gets the query results for the next page of data,
// - stores that unformatted data on .result
// - increates the page count
// - handles filtering out column data from results
func (r *Rows) fetchNextPage(token *string) error {
	var err error
	r.result, err = r.client.GetQueryResults(
		&athena.GetQueryResultsInput{
			QueryExecutionId: aws.String(r.queryID),
			NextToken:        token,
		})
	if err != nil {
		return err
	}

	r.pageCount++

	r.handleColumnCleanup()

	// determine if we're on the first page and we have a column row that we should remove from results
	var rowOffset = 0
	if r.pageCount == 1 {
		rs := r.result.ResultSet
		ci := r.result.ResultSet.ResultSetMetadata.ColumnInfo
		i := 0
		if len(ci) > 0 && len(rs.Rows) > 0 && len(rs.Rows[0].Data) > 0 && len(rs.Rows[0].Data) == len(ci) {
			for ; i < len(ci); i++ {
				if rs.Rows[0].Data[i] == nil || rs.Rows[0].Data[i].VarCharValue == nil {
					break
				}
				if *ci[i].Name != *rs.Rows[0].Data[i].VarCharValue {
					break
				}
			}
			if i == len(ci) {
				rowOffset = 1
			}
		}
	}

	// if there is no rows or just a column row, we are done
	if len(r.result.ResultSet.Rows) <= rowOffset {
		r.doneLoading = true
		return nil
	}

	// remove the column from the data if it's there (Since it's store elsewhere in column info)
	r.result.ResultSet.Rows = r.result.ResultSet.Rows[rowOffset:]

	return nil
}

func (r *Rows) handleColumnCleanup() {
	// The first row of the first page contains header/column info if the query is not DDL.
	// These are also available in *athenaAPI.Row.ResultSetMetadata.
	// However sometimes Athena's go API will return row data without corresponding ColumnInfo. 
	// To circumvent this situation, we choose to name the column as `column` + 0-index-based number 
	// to match their implementation

	// One example is:
	//   input:
	//      MSCK REPAIR TABLE sampledb.elb_logs
	//   output:
	//     _col0
	//     Partitions not in metastore:    elb_logs:2015/01/01     elb_logs:2015/01/02     elb_logs:2015/01/03
	//       elb_logs:2015/01/04     elb_logs:2015/01/05     elb_logs:2015/01/06     elb_logs:2015/01/07
	hasColumnInfo := r.result != nil &&
		r.result.ResultSet.ResultSetMetadata != nil &&
		r.result.ResultSet.ResultSetMetadata.ColumnInfo != nil
	if hasColumnInfo {
		rowLen := len(r.result.ResultSet.Rows)
		colInfoLen := len(r.result.ResultSet.ResultSetMetadata.ColumnInfo)
		hasRows := rowLen > 0
		if hasRows {
			firstRowDataLen := len(r.result.ResultSet.Rows[0].Data)

			// if missing column info, create new column info from the first row's data
			hasMissingColumnInfo := colInfoLen < firstRowDataLen 
			if hasMissingColumnInfo {
				for i := 0; i < firstRowDataLen-colInfoLen; i++ {
					colName := "_col" + strconv.Itoa(i+colInfoLen)
					colType := "string"
					colInfo := newColumnInfo(colName, colType)
					r.result.ResultSet.ResultSetMetadata.ColumnInfo = append(r.result.ResultSet.ResultSetMetadata.ColumnInfo,
						colInfo)
				}
			// if we have more column info than we have columns showing, 
			// then we need to create the data in from the first item in each row
			} else if colInfoLen > firstRowDataLen && firstRowDataLen == 1 {
				for k := 0; k < rowLen; k++ {
					items := strings.Split(*r.result.ResultSet.Rows[k].Data[0].VarCharValue, "\t")
					if len(items) == colInfoLen {
						for i, v := range items {
							items[i] = strings.TrimSpace(v)
						}
						r.result.ResultSet.Rows[k] = newRow(colInfoLen, items)
					}
				}
			}
		} else if rowLen == 0 && colInfoLen == 1 && r.result.UpdateCount != nil {
			if *r.result.UpdateCount > 0 {
				if *r.result.ResultSet.ResultSetMetadata.ColumnInfo[0].Name == "rows" {
					// For DML's INSERT INTO, DDL's CTAS
					updateCount := strconv.FormatInt(*r.result.UpdateCount, 10)
					rData := athena.Datum{VarCharValue: &updateCount}
					aRow := athena.Row{Data: []*athena.Datum{&rData}}
					r.result.ResultSet.Rows = append(r.result.ResultSet.Rows, &aRow)
				}
			}
		}
	}
}

// convertRow is to convert data from Athena type to Golang SQL type and put them into an array of driver.Value.
func (r *Rows) convertRow(columns []*athena.ColumnInfo, rdata []*athena.Datum, ret []driver.Value) error {
	for i, val := range rdata {
		if val == nil {
			continue
		}
		goVersionOfValue, err := r.convertValueFromAthena(columns[i], val.VarCharValue)
		if err != nil {
			return err
		}
		ret[i] = goVersionOfValue
	}
	return nil
}

// convertValueFromAthena converts Athena type to Golang SQL type.
// https://docs.aws.amazon.com/en_pv/athena/latest/ug/data-types.html
// https://docs.aws.amazon.com/athena/latest/ug/geospatial-input-data-formats-supported-geometry-types.html#geometry-data-types
// varbinary is undocumented above, but appears in geo query like:
//   SELECT ST_POINT(-74.006801, 40.705220).
// json is also undocumented above, but appears here https://docs.aws.amazon.com/athena/latest/ug/querying-JSON.html
// The full list is here: https://prestodb.io/docs/0.172/language/types.html
// Include ipaddress for forward compatibility.
func (r *Rows) convertValueFromAthena(columnInfo *athena.ColumnInfo, rawValue *string) (interface{}, error) {
	if rawValue == nil {
		return nil, nil
	}
	val := *rawValue
	// https://stackoverflow.com/questions/30299649/parse-string-to-specific-type-of-int-int8-int16-int32-int64
	// https://prestodb.io/docs/current/language/types.html#integer
	var err error
	var i int64
	var f float64
	switch *columnInfo.Type {
	case "tinyint":
		// strconv.ParseInt() behavior is to return (int64(0), err)
		// which is not as good as just return (nil, err)
		if i, err = strconv.ParseInt(val, 10, 8); err != nil {
			return nil, err
		}
		return int8(i), nil
	case "smallint":
		if i, err = strconv.ParseInt(val, 10, 16); err != nil {
			return nil, err
		}
		return int16(i), nil
	case "integer":
		if i, err = strconv.ParseInt(val, 10, 32); err != nil {
			return nil, err
		}
		return int32(i), nil
	case "bigint":
		if i, err = strconv.ParseInt(val, 10, 64); err != nil {
			return nil, err
		}
		return i, nil
	case "float", "real":
		if f, err = strconv.ParseFloat(val, 32); err != nil {
			return nil, err
		}
		return float32(f), nil
	case "double":
		if f, err = strconv.ParseFloat(val, 64); err != nil {
			return nil, err
		}
		return f, nil
	// for binary, we assume all chars are 0 or 1; for json,
	// we assume the json syntax is correct. Leave to caller to verify it.
	case "json", "char", "varchar", "varbinary", "row", "string", "binary",
		"struct", "interval year to month", "interval day to second", "decimal",
		"ipaddress", "array", "map", "unknown":
		return val, nil
	case "boolean":
		if val == "true" {
			return true, nil
		} else if val == "false" {
			return false, nil
		}
		return nil, fmt.Errorf("unknown value `%s` for boolean", val)
	case "date", "time", "time with time zone", "timestamp", "timestamp with time zone":
		t, err := time.Parse("2006-01-02 15:04:05", val)
		if err != nil {
			return nil, err
		}
		return t, nil
	default:
		return nil, fmt.Errorf("unsupported type %s", *columnInfo.Type)
	}
}


func newColumnInfo(colName string, colType interface{}) *athena.ColumnInfo {
	caseSensitive := false
	catalogName := ""
	nullable := "UNKNOWN"
	precision := int64(19)
	scale := int64(0)
	schemaName := ""
	tableName := ""
	if colType == nil {
		return &athena.ColumnInfo{
			CaseSensitive: &caseSensitive,
			CatalogName:   &catalogName,
			Label:         &colName,
			Name:          &colName,
			Nullable:      &nullable,
			Precision:     &precision,
			Scale:         &scale,
			SchemaName:    &schemaName,
			TableName:     &tableName,
			Type:          nil,
		}
	}
	ct := colType.(string)
	return &athena.ColumnInfo{
		CaseSensitive: &caseSensitive,
		CatalogName:   &catalogName,
		Label:         &colName,
		Name:          &colName,
		Nullable:      &nullable,
		Precision:     &precision,
		Scale:         &scale,
		SchemaName:    &schemaName,
		TableName:     &tableName,
		Type:          &ct,
	}
}

func newRow(colLen int, rData []string) *athena.Row {
	var nData = make([]*athena.Datum, colLen)
	for i := 0; i < colLen; i++ {
		nData[i] = &athena.Datum{VarCharValue: &rData[i]}
	}
	return &athena.Row{
		Data: nData,
	}
}