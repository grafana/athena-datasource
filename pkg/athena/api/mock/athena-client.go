package mock

import (
	"context"
	"errors"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/athena"
	athenatypes "github.com/aws/aws-sdk-go-v2/service/athena/types"
)

const DESCRIBE_STATEMENT_FAILED = "DESCRIBE_STATEMENT_FAILED"
const DESCRIBE_STATEMENT_SUCCEEDED = "DESCRIBE_STATEMENT_FINISHED"
const UNEXPECTED_ERROR = "UNEXPECTED_ERROR"

// Define a mock struct to be used in your unit tests of myFunc.
type MockAthenaClient struct {
	CalledTimesCounter     int
	CalledTimesCountDown   int
	ErrorCategory          *int32
	Catalogs               []string
	Databases              []string
	Workgroups             []string
	WorkgroupEngineVersion string
	TableMetadataList      []string
	Columns                []string
	Cancelled              bool
}

func (m *MockAthenaClient) GetQueryExecution(_ context.Context, input *athena.GetQueryExecutionInput, _ ...func(*athena.Options)) (*athena.GetQueryExecutionOutput, error) {
	// mock response/functionality
	m.CalledTimesCountDown--
	m.CalledTimesCounter++

	output := &athena.GetQueryExecutionOutput{}
	if m.CalledTimesCountDown == 0 {
		switch *input.QueryExecutionId {
		case UNEXPECTED_ERROR:
			output.QueryExecution = &athenatypes.QueryExecution{
				Status: &athenatypes.QueryExecutionStatus{
					State:             athenatypes.QueryExecutionStateFailed,
					StateChangeReason: aws.String(UNEXPECTED_ERROR),
					AthenaError:       nil,
				},
			}
		case DESCRIBE_STATEMENT_FAILED:
			output.QueryExecution = &athenatypes.QueryExecution{
				Status: &athenatypes.QueryExecutionStatus{
					State:             athenatypes.QueryExecutionStateFailed,
					StateChangeReason: aws.String(DESCRIBE_STATEMENT_FAILED),
					AthenaError:       &athenatypes.AthenaError{ErrorCategory: nil},
				},
			}
			if m.ErrorCategory != nil {
				output.QueryExecution.Status.AthenaError.ErrorCategory = m.ErrorCategory
			}
		default:
			output.QueryExecution = &athenatypes.QueryExecution{
				Status: &athenatypes.QueryExecutionStatus{
					State: athenatypes.QueryExecutionStateSucceeded,
				},
			}
		}
	} else {
		output.QueryExecution = &athenatypes.QueryExecution{
			Status: &athenatypes.QueryExecutionStatus{
				State: athenatypes.QueryExecutionStateRunning,
			},
		}
	}
	return output, nil
}

func (m *MockAthenaClient) GetWorkGroup(_ context.Context, _ *athena.GetWorkGroupInput, _ ...func(*athena.Options)) (*athena.GetWorkGroupOutput, error) {
	output := &athena.GetWorkGroupOutput{
		WorkGroup: &athenatypes.WorkGroup{
			Configuration: &athenatypes.WorkGroupConfiguration{
				EngineVersion: &athenatypes.EngineVersion{
					EffectiveEngineVersion: aws.String(m.WorkgroupEngineVersion),
					SelectedEngineVersion:  aws.String(m.WorkgroupEngineVersion),
				},
			},
		},
	}
	return output, nil
}

const FAKE_ERROR = "FAKE_ERROR"
const FAKE_SUCCESS = "FAKE_SUCCESS"
const FAKE_INTERNAL_ERROR = "FAKE_INTERNAL_ERROR"
const FAKE_USER_ERROR = "FAKE_USER_ERROR"

var AthenaInternalServerErrorMock = &athenatypes.InternalServerException{Message: aws.String("Internal Server Error")}
var AthenaUserErrorMock = &athenatypes.InvalidRequestException{Message: aws.String("Syntax error in SQL statement")}

func (m *MockAthenaClient) StartQueryExecution(_ context.Context, input *athena.StartQueryExecutionInput, _ ...func(*athena.Options)) (*athena.StartQueryExecutionOutput, error) {
	output := &athena.StartQueryExecutionOutput{
		QueryExecutionId: input.QueryString,
	}
	if *input.QueryString == FAKE_ERROR {
		return nil, errors.New(FAKE_ERROR)
	}
	if *input.QueryString == FAKE_INTERNAL_ERROR {
		return nil, AthenaInternalServerErrorMock
	}
	if *input.QueryString == FAKE_USER_ERROR {
		return nil, AthenaUserErrorMock
	}

	return output, nil
}

func (m *MockAthenaClient) GetQueryResults(_ context.Context, input *athena.GetQueryResultsInput, _ ...func(*athena.Options)) (*athena.GetQueryResultsOutput, error) {
	if *input.QueryExecutionId == FAKE_ERROR {
		return nil, errors.New(FAKE_ERROR)
	}

	output := &athena.GetQueryResultsOutput{
		NextToken: input.NextToken,
		ResultSet: &athenatypes.ResultSet{
			ResultSetMetadata: &athenatypes.ResultSetMetadata{
				ColumnInfo: []athenatypes.ColumnInfo{},
			},
			Rows: []athenatypes.Row{},
		},
	}

	return output, nil
}

func (m *MockAthenaClient) ListDataCatalogs(_ context.Context, _ *athena.ListDataCatalogsInput, _ ...func(*athena.Options)) (*athena.ListDataCatalogsOutput, error) {
	r := &athena.ListDataCatalogsOutput{}
	for _, c := range m.Catalogs {
		r.DataCatalogsSummary = append(r.DataCatalogsSummary, athenatypes.DataCatalogSummary{CatalogName: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) ListDatabases(_ context.Context, _ *athena.ListDatabasesInput, _ ...func(*athena.Options)) (*athena.ListDatabasesOutput, error) {
	r := &athena.ListDatabasesOutput{}
	for _, c := range m.Databases {
		r.DatabaseList = append(r.DatabaseList, athenatypes.Database{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) ListWorkGroups(_ context.Context, _ *athena.ListWorkGroupsInput, _ ...func(*athena.Options)) (*athena.ListWorkGroupsOutput, error) {
	r := &athena.ListWorkGroupsOutput{}
	for _, c := range m.Workgroups {
		r.WorkGroups = append(r.WorkGroups, athenatypes.WorkGroupSummary{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) ListTableMetadata(_ context.Context, _ *athena.ListTableMetadataInput, _ ...func(options *athena.Options)) (*athena.ListTableMetadataOutput, error) {
	r := &athena.ListTableMetadataOutput{}
	for _, c := range m.TableMetadataList {
		r.TableMetadataList = append(r.TableMetadataList, athenatypes.TableMetadata{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) GetTableMetadata(_ context.Context, _ *athena.GetTableMetadataInput, _ ...func(options *athena.Options)) (*athena.GetTableMetadataOutput, error) {
	r := &athena.GetTableMetadataOutput{}
	r.TableMetadata = &athenatypes.TableMetadata{Name: aws.String("fake table metadata")}
	for _, c := range m.Columns {
		r.TableMetadata.Columns = append(r.TableMetadata.Columns, athenatypes.Column{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) StopQueryExecution(_ context.Context, _ *athena.StopQueryExecutionInput, _ ...func(*athena.Options)) (*athena.StopQueryExecutionOutput, error) {
	m.Cancelled = true
	return &athena.StopQueryExecutionOutput{}, nil
}

// boilerplate to satisfy athenadriver.Client

func (m *MockAthenaClient) CreateWorkGroup(_ context.Context, _ *athena.CreateWorkGroupInput, _ ...func(*athena.Options)) (*athena.CreateWorkGroupOutput, error) {
	//TODO implement me
	panic("implement me")
}
