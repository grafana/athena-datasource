package api

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/service/athena"
)

// perUserClient resolves the Athena client on every call, so each request is
// signed with credentials for the user in its context. The API and DB caches in
// grafana-aws-sdk and sqlds are keyed by datasource, not user, so a client
// fixed at creation would carry the first user's SourceIdentity for everyone.
// awsauth caches the credentials per identity, so resolving per call is cheap.
type perUserClient struct {
	resolve func(ctx context.Context) (Client, error)
}

var _ Client = &perUserClient{}

func (p *perUserClient) CreateWorkGroup(ctx context.Context, in *athena.CreateWorkGroupInput, opts ...func(*athena.Options)) (*athena.CreateWorkGroupOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.CreateWorkGroup(ctx, in, opts...)
}

func (p *perUserClient) GetQueryExecution(ctx context.Context, in *athena.GetQueryExecutionInput, opts ...func(*athena.Options)) (*athena.GetQueryExecutionOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.GetQueryExecution(ctx, in, opts...)
}

func (p *perUserClient) GetQueryResults(ctx context.Context, in *athena.GetQueryResultsInput, opts ...func(*athena.Options)) (*athena.GetQueryResultsOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.GetQueryResults(ctx, in, opts...)
}

func (p *perUserClient) GetWorkGroup(ctx context.Context, in *athena.GetWorkGroupInput, opts ...func(*athena.Options)) (*athena.GetWorkGroupOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.GetWorkGroup(ctx, in, opts...)
}

func (p *perUserClient) StartQueryExecution(ctx context.Context, in *athena.StartQueryExecutionInput, opts ...func(*athena.Options)) (*athena.StartQueryExecutionOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.StartQueryExecution(ctx, in, opts...)
}

func (p *perUserClient) StopQueryExecution(ctx context.Context, in *athena.StopQueryExecutionInput, opts ...func(*athena.Options)) (*athena.StopQueryExecutionOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.StopQueryExecution(ctx, in, opts...)
}

func (p *perUserClient) ListDataCatalogs(ctx context.Context, in *athena.ListDataCatalogsInput, opts ...func(*athena.Options)) (*athena.ListDataCatalogsOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.ListDataCatalogs(ctx, in, opts...)
}

func (p *perUserClient) ListDatabases(ctx context.Context, in *athena.ListDatabasesInput, opts ...func(*athena.Options)) (*athena.ListDatabasesOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.ListDatabases(ctx, in, opts...)
}

func (p *perUserClient) ListWorkGroups(ctx context.Context, in *athena.ListWorkGroupsInput, opts ...func(*athena.Options)) (*athena.ListWorkGroupsOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.ListWorkGroups(ctx, in, opts...)
}

func (p *perUserClient) ListTableMetadata(ctx context.Context, in *athena.ListTableMetadataInput, opts ...func(*athena.Options)) (*athena.ListTableMetadataOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.ListTableMetadata(ctx, in, opts...)
}

func (p *perUserClient) GetTableMetadata(ctx context.Context, in *athena.GetTableMetadataInput, opts ...func(*athena.Options)) (*athena.GetTableMetadataOutput, error) {
	c, err := p.resolve(ctx)
	if err != nil {
		return nil, err
	}
	return c.GetTableMetadata(ctx, in, opts...)
}
