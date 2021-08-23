package mock

import (
	"errors"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/service/athena"
	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
)

const DESCRIBE_STATEMENT_FAILED = "DESCRIBE_STATEMENT_FAILED"
const DESCRIBE_STATEMENT_SUCCEEDED = "DESCRIBE_STATEMENT_FINISHED"

// Define a mock struct to be used in your unit tests of myFunc.
type MockAthenaClient struct {
	CalledTimesCounter   int
	CalledTimesCountDown int

	athenaiface.AthenaAPI
}

func (m *MockAthenaClient) GetQueryExecutionWithContext(ctx aws.Context, input *athena.GetQueryExecutionInput, opts ...request.Option) (*athena.GetQueryExecutionOutput, error) {
	// mock response/functionality
	m.CalledTimesCountDown--
	m.CalledTimesCounter++

	output := &athena.GetQueryExecutionOutput{}
	if m.CalledTimesCountDown == 0 {
		if *input.QueryExecutionId == DESCRIBE_STATEMENT_FAILED {
			output.QueryExecution = &athena.QueryExecution{
				Status: &athena.QueryExecutionStatus{
					State:             aws.String(athena.QueryExecutionStateFailed),
					StateChangeReason: aws.String(DESCRIBE_STATEMENT_FAILED),
				},
			}
		} else {
			output.QueryExecution = &athena.QueryExecution{
				Status: &athena.QueryExecutionStatus{
					State: aws.String(athena.QueryExecutionStateSucceeded),
				},
			}
		}
	} else {
		output.QueryExecution = &athena.QueryExecution{
			Status: &athena.QueryExecutionStatus{
				State: aws.String(athena.QueryExecutionStateRunning),
			},
		}
	}
	return output, nil
}

const FAKE_ERROR = "FAKE_ERROR"
const FAKE_SUCCESS = "FAKE_SUCCESS"

func (m *MockAthenaClient) StartQueryExecutionWithContext(ctx aws.Context, input *athena.StartQueryExecutionInput, opts ...request.Option) (*athena.StartQueryExecutionOutput, error) {
	output := &athena.StartQueryExecutionOutput{
		QueryExecutionId: input.QueryString,
	}
	if *input.QueryString == FAKE_ERROR {
		return nil, errors.New(FAKE_ERROR)
	}

	return output, nil
}

const EMPTY_ROWS = "EMPTY_ROWS"
const ROWS_WITH_NEXT = "RowsWithNext"

func (m *MockAthenaClient) GetQueryResults(input *athena.GetQueryResultsInput) (*athena.GetQueryResultsOutput, error) {
	if *input.QueryExecutionId == FAKE_ERROR {
		return nil, errors.New(FAKE_ERROR)
	}

	output := &athena.GetQueryResultsOutput{
		NextToken: input.NextToken,
		ResultSet: &athena.ResultSet{
			ResultSetMetadata: &athena.ResultSetMetadata{
				ColumnInfo: []*athena.ColumnInfo{},
			},
			Rows: []*athena.Row{},
		},
	}

	if *input.QueryExecutionId == ROWS_WITH_NEXT {
		next := "oneMorePage"
		output.NextToken = &next
		fakeVarChar := "someString"
		fakeDatum := athena.Datum{
			VarCharValue: &fakeVarChar,
		}
		fakeColumnName := "_col0"
		fakeColumn := athena.Datum{
			VarCharValue: &fakeColumnName,
		}
		output.ResultSet.Rows = append(output.ResultSet.Rows,
			&athena.Row{
				Data: []*athena.Datum{&fakeColumn},
			},
			&athena.Row{
				Data: []*athena.Datum{&fakeDatum},
			},
		)
		fakeNullable := "NULLABLE"
		fakePrecision := int64(1)
		fakeType := "varchar"
		fakeName := "name"
		fakeColumnInfo := athena.ColumnInfo{
			Name:      &fakeName,
			Nullable:  &fakeNullable,
			Precision: &fakePrecision,
			Type:      &fakeType,
		}
		output.ResultSet.ResultSetMetadata.ColumnInfo = []*athena.ColumnInfo{&fakeColumnInfo}
	}

	return output, nil
}
