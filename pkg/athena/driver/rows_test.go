package driver

import (
	"database/sql/driver"
	"fmt"
	"io"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go/service/athena"
	athenaclientmock "github.com/grafana/athena-datasource/pkg/athena/driver/mock"
	"gotest.tools/assert"
)

func TestRows_newRows(t *testing.T) {
	mockClient := &athenaclientmock.MockAthenaClient{}
	nilRows, err := newRows(mockClient, athenaclientmock.FAKE_ERROR)

	assert.Equal(t, err.Error(), athenaclientmock.FAKE_ERROR)
	var expectedNilRows *Rows
	assert.Equal(t, nilRows, expectedNilRows)

	r, err := newRows(&athenaclientmock.MockAthenaClient{}, "queryId")
	assert.Equal(t, err, nil)
	assert.Equal(t, r.queryID, "queryId")
}

var NextTestCases = []struct {
	queryID     string
	err         error
	doneLoading bool
}{

	{athenaclientmock.EMPTY_ROWS, io.EOF, true},
	{athenaclientmock.ROWS_WITH_NEXT, nil, false},
}

func TestRows_Next(t *testing.T) {
	t.Parallel()

	for _, tc := range NextTestCases {
		r, errorMakingNewRows := newRows(&athenaclientmock.MockAthenaClient{}, tc.queryID)
		assert.Equal(t, errorMakingNewRows, nil)

		dest := make([]driver.Value, 2)
		expectedNextError := r.Next(dest)
		assert.Equal(t, expectedNextError, tc.err)
		assert.Equal(t, r.doneLoading, tc.doneLoading)
	}
}

func convertValueTestCases() []struct {
	columnInfoType string
	rawValue       string
	returnedVal    interface{}
	err            error
} {
	timeString := "2001-01-01 01:01:01"
	parsedTime, parsingErr := time.Parse("2006-01-02 15:04:05", timeString)
	if parsingErr != nil {
		panic("parsing error with time test case")
	}
	var testCases = []struct {
		columnInfoType string
		rawValue       string
		returnedVal    interface{}
		err            error
	}{

		{"tinyint", "1", int8(1), nil},
		{"smallint", "1", int16(1), nil},
		{"integer", "1", int32(1), nil},
		{"bigint", "1", int64(1), nil},
		{"float", "1", float32(1), nil},
		{"double", "1", float64(1), nil},
		{"char", "1", "1", nil},
		{"boolean", "true", true, nil},
		{"time", timeString, parsedTime, nil},
		{"imaginaryType", "we shouldn't be able to parse this val", nil, fmt.Errorf("unsupported type imaginaryType")},
	}

	return testCases
}

func TestRows_convertValueFromAthena(t *testing.T) {
	t.Parallel()
	cases := convertValueTestCases()

	for _, tc := range cases {
		r, errorMakingNewRows := newRows(&athenaclientmock.MockAthenaClient{}, "queryId")
		assert.Equal(t, errorMakingNewRows, nil)

		fakeNullable := "NULLABLE"
		fakePrecision := int64(1)
		fakeType := tc.columnInfoType
		fakeName := "name"
		fakeColumnInfo := athena.ColumnInfo{
			Name:      &fakeName,
			Nullable:  &fakeNullable,
			Precision: &fakePrecision,
			Type:      &fakeType,
		}
		returnVal, err := r.convertValueFromAthena(&fakeColumnInfo, &tc.rawValue)
		if err != nil {
			assert.Equal(t, err.Error(), tc.err.Error())
		} else {
			assert.Equal(t, err, tc.err)
		}
		assert.Equal(t, returnVal, tc.returnedVal)
	}
}
