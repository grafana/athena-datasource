package api

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/athena"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsauth"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type stubHTTP struct{}

func (stubHTTP) Do(*http.Request) (*http.Response, error) { return nil, errors.New("stub transport") }

// identityRecorder records the SourceIdentity each GetConfig call would use.
type identityRecorder struct {
	settings   []awsauth.Settings
	identities []string
}

func (r *identityRecorder) GetConfig(ctx context.Context, s awsauth.Settings) (aws.Config, error) {
	r.settings = append(r.settings, s)
	r.identities = append(r.identities, awsauth.SourceIdentityFromUser(ctx))
	return aws.Config{Region: "us-east-1", HTTPClient: stubHTTP{}, Retryer: func() aws.Retryer { return aws.NopRetryer{} }}, nil
}

func loadSettings(t *testing.T, jsonData string) *models.AthenaDataSourceSettings {
	t.Helper()
	s := &models.AthenaDataSourceSettings{}
	require.NoError(t, s.Load(backend.DataSourceInstanceSettings{JSONData: []byte(jsonData)}))
	return s
}

func withProvider(t *testing.T, p awsauth.ConfigProvider) {
	t.Helper()
	orig := newAWSConfigProvider
	newAWSConfigProvider = func() awsauth.ConfigProvider { return p }
	t.Cleanup(func() { newAWSConfigProvider = orig })
}

func userCtx(login string) context.Context {
	return backend.WithUser(context.Background(), &backend.User{Login: login})
}

func TestNew_sourceIdentityFlagOn_resolvesClientPerUser(t *testing.T) {
	rec := &identityRecorder{}
	withProvider(t, rec)

	s := loadSettings(t, `{"authType":"grafana_assume_role","defaultRegion":"us-east-1","assumeRoleArn":"arn:aws:iam::123456789012:role/test","sourceIdentityFromUser":true}`)
	a, err := New(context.Background(), s)
	require.NoError(t, err)
	assert.True(t, rec.settings[0].SourceIdentityFromUser)

	client := a.(*API).Client
	require.IsType(t, &perUserClient{}, client)

	// One API object is shared by all users; each call must see its own user.
	for _, u := range []string{"alice", "bob", "alice"} {
		_, err = client.ListWorkGroups(userCtx(u), &athena.ListWorkGroupsInput{})
		require.Error(t, err) // stub transport
	}
	// index 0 is the eager call in New (no user)
	assert.Equal(t, []string{"", "alice", "bob", "alice"}, rec.identities)
}

func TestNew_sourceIdentityFlagOff_keepsFixedClient(t *testing.T) {
	rec := &identityRecorder{}
	withProvider(t, rec)

	s := loadSettings(t, `{"authType":"grafana_assume_role","defaultRegion":"us-east-1","assumeRoleArn":"arn:aws:iam::123456789012:role/test"}`)
	a, err := New(context.Background(), s)
	require.NoError(t, err)

	assert.False(t, rec.settings[0].SourceIdentityFromUser)
	assert.IsType(t, &athena.Client{}, a.(*API).Client)

	_, _ = a.(*API).Client.ListWorkGroups(userCtx("alice"), &athena.ListWorkGroupsInput{})
	assert.Len(t, rec.settings, 1, "flag off must not resolve credentials per call")
}

func TestPerUserClient_resolveErrorIsReturned(t *testing.T) {
	boom := errors.New("sts denied")
	c := &perUserClient{resolve: func(context.Context) (Client, error) { return nil, boom }}
	ctx := context.Background()

	_, err := c.StartQueryExecution(ctx, &athena.StartQueryExecutionInput{})
	assert.ErrorIs(t, err, boom)
	_, err = c.GetQueryExecution(ctx, &athena.GetQueryExecutionInput{})
	assert.ErrorIs(t, err, boom)
	_, err = c.GetQueryResults(ctx, &athena.GetQueryResultsInput{})
	assert.ErrorIs(t, err, boom)
	_, err = c.StopQueryExecution(ctx, &athena.StopQueryExecutionInput{})
	assert.ErrorIs(t, err, boom)
	_, err = c.ListDatabases(ctx, &athena.ListDatabasesInput{})
	assert.ErrorIs(t, err, boom)
	_, err = c.GetTableMetadata(ctx, &athena.GetTableMetadataInput{})
	assert.ErrorIs(t, err, boom)
}

func TestCancelQuery_usesRequestContextUser(t *testing.T) {
	rec := &identityRecorder{}
	withProvider(t, rec)

	s := loadSettings(t, `{"authType":"grafana_assume_role","defaultRegion":"us-east-1","assumeRoleArn":"arn:aws:iam::123456789012:role/test","sourceIdentityFromUser":true}`)
	a, err := New(context.Background(), s)
	require.NoError(t, err)

	_ = a.(*API).CancelQuery(userCtx("carol"), nil, "q-1")
	assert.Equal(t, "carol", rec.identities[len(rec.identities)-1])
}
