package driver

import (
	"database/sql/driver"
	"io"
	"testing"

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
