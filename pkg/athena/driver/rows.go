package driver

import (
	"database/sql/driver"
	"io"
	"reflect"

	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
)

type Rows struct {
	client  athenaiface.AthenaAPI
	queryID string

	done bool
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
	if r.done {
		return io.EOF
	}

	// TBD
	return nil
}

// Columns returns the names of the columns.
func (r *Rows) Columns() []string {
	// TBD
	columnNames := []string{}
	return columnNames
}

// ColumnTypeNullable returns true if it is known the column may be null,
// or false if the column is known to be not nullable. If the column nullability is unknown, ok should be false.
func (r *Rows) ColumnTypeNullable(index int) (nullable, ok bool) {
	// TBD
	return false, true
}

// ColumnTypeScanType returns the value type that can be used to scan types into.
// For example, the database column type "bigint" this should return "reflect.TypeOf(int64(0))"
func (r *Rows) ColumnTypeScanType(index int) reflect.Type {
	// TBD
	return reflect.TypeOf("")
}

// ColumnTypeDatabaseTypeName converts a redshift data type to a corresponding go sql type
func (r *Rows) ColumnTypeDatabaseTypeName(index int) string {
	// TBD
	return "VARCHAR"
}

// Close closes the rows iterator.
func (r *Rows) Close() error {
	// TBD
	r.done = true
	return nil
}

// fetchNextPage fetches the next statement result page and adds the result to the row
func (r *Rows) fetchNextPage(token *string) error {
	// TBD
	return nil
}
