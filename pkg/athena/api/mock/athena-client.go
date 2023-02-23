package mock

import (
	"context"
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
	CalledTimesCounter     int
	CalledTimesCountDown   int
	Catalogs               []string
	Databases              []string
	Workgroups             []string
	WorkgroupEngineVersion string
	TableMetadataList      []string
	Columns                []string
	Cancelled              bool
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

func (m *MockAthenaClient) GetWorkGroupWithContext(ctx aws.Context, input *athena.GetWorkGroupInput, opts ...request.Option) (*athena.GetWorkGroupOutput, error) {
	output := &athena.GetWorkGroupOutput{
		WorkGroup: &athena.WorkGroup{
			Configuration: &athena.WorkGroupConfiguration{
				EngineVersion: &athena.EngineVersion{
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

func (m *MockAthenaClient) GetQueryResultsWithContext(ctx context.Context, input *athena.GetQueryResultsInput, opts ...request.Option) (*athena.GetQueryResultsOutput, error) {
	return &athena.GetQueryResultsOutput{
		ResultSet: &athena.ResultSet{
			ResultSetMetadata: &athena.ResultSetMetadata{},
			Rows:              []*athena.Row{},
		},
	}, nil
}

func (m *MockAthenaClient) ListDataCatalogsWithContext(ctx aws.Context, input *athena.ListDataCatalogsInput, opts ...request.Option) (*athena.ListDataCatalogsOutput, error) {
	r := &athena.ListDataCatalogsOutput{}
	for _, c := range m.Catalogs {
		r.DataCatalogsSummary = append(r.DataCatalogsSummary, &athena.DataCatalogSummary{CatalogName: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) ListDatabasesWithContext(ctx aws.Context, input *athena.ListDatabasesInput, opts ...request.Option) (*athena.ListDatabasesOutput, error) {
	r := &athena.ListDatabasesOutput{}
	for _, c := range m.Databases {
		r.DatabaseList = append(r.DatabaseList, &athena.Database{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) ListWorkGroupsWithContext(ctx aws.Context, input *athena.ListWorkGroupsInput, opts ...request.Option) (*athena.ListWorkGroupsOutput, error) {
	r := &athena.ListWorkGroupsOutput{}
	for _, c := range m.Workgroups {
		r.WorkGroups = append(r.WorkGroups, &athena.WorkGroupSummary{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) ListTableMetadataWithContext(ctx aws.Context, input *athena.ListTableMetadataInput, opts ...request.Option) (*athena.ListTableMetadataOutput, error) {
	r := &athena.ListTableMetadataOutput{}
	for _, c := range m.TableMetadataList {
		r.TableMetadataList = append(r.TableMetadataList, &athena.TableMetadata{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) GetTableMetadataWithContext(ctx aws.Context, input *athena.GetTableMetadataInput, opts ...request.Option) (*athena.GetTableMetadataOutput, error) {
	r := &athena.GetTableMetadataOutput{}
	r.TableMetadata = &athena.TableMetadata{Name: aws.String("fake table metadata")}
	for _, c := range m.Columns {
		r.TableMetadata.Columns = append(r.TableMetadata.Columns, &athena.Column{Name: aws.String(c)})
	}
	return r, nil
}

func (m *MockAthenaClient) StopQueryExecution(input *athena.StopQueryExecutionInput) (*athena.StopQueryExecutionOutput, error) {
	m.Cancelled = true
	return &athena.StopQueryExecutionOutput{}, nil
}
