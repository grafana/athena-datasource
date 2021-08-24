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
