package driver

import (
	"context"
	"database/sql/driver"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/athena"
	"github.com/aws/aws-sdk-go/service/athena/athenaiface"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/jpillora/backoff"
)

type conn struct {
	sessionCache    *awsds.SessionCache
	settings        *models.AthenaDataSourceSettings
	backoffInstance backoff.Backoff
	closed          bool
	mockedClient    athenaiface.AthenaAPI
}

func newConnection(sessionCache *awsds.SessionCache, settings *models.AthenaDataSourceSettings) *conn {
	return &conn{
		sessionCache: sessionCache,
		settings:     settings,
		backoffInstance: backoff.Backoff{
			Min:    500 * time.Millisecond,
			Max:    10 * time.Minute,
			Factor: 2,
		},
	}
}

func (c *conn) GetAthenaClient() (athenaiface.AthenaAPI, error) {
	if c.mockedClient != nil {
		return c.mockedClient, nil
	}

	region := c.settings.DefaultRegion
	if c.settings.Region != "" {
		region = c.settings.Region
	}
	session, err := c.sessionCache.GetSession(region, c.settings.AWSDatasourceSettings)
	if err != nil {
		return nil, err
	}
	client := athena.New(session)
	return client, nil
}

func (c *conn) QueryContext(ctx context.Context, query string, _ []driver.NamedValue) (driver.Rows, error) {
	client, err := c.GetAthenaClient()
	if err != nil {
		return nil, err
	}
	executionResult, err := client.StartQueryExecutionWithContext(ctx, &athena.StartQueryExecutionInput{
		QueryString: aws.String(query),
		QueryExecutionContext: &athena.QueryExecutionContext{
			Catalog:  aws.String(c.settings.Catalog),
			Database: aws.String(c.settings.Database),
		},
		WorkGroup: aws.String(c.settings.WorkGroup),
		// TODO:
		// 	consider if we also want output location to be configurable
		// 	seems like you can specify either work group or output location
		// ResultConfiguration: &athena.ResultConfiguration{
		// 	OutputLocation: aws.String(c.settings.OutputLocation),
		// },
	})

	if err != nil {
		return nil, err
	}

	if err := c.waitOnQuery(ctx, client, *executionResult.QueryExecutionId); err != nil {
		return nil, err
	}

	return newRows(client, *executionResult.QueryExecutionId)
}

// waitOnQuery polls the athena api until the query finishes, returning an error if it failed.
func (c *conn) waitOnQuery(ctx context.Context, client athenaiface.AthenaAPI, queryID string) error {
	for {
		statusResp, err := client.GetQueryExecutionWithContext(ctx, &athena.GetQueryExecutionInput{
			QueryExecutionId: aws.String(queryID),
		})
		if err != nil {
			return err
		}

		switch *statusResp.QueryExecution.Status.State {
		case athena.QueryExecutionStateFailed:
			reason := *statusResp.QueryExecution.Status.StateChangeReason
			return errors.New(reason)
		case athena.QueryExecutionStateSucceeded:
			return nil
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(c.backoffInstance.Duration()):
			continue
		}
	}
}

// called by CheckHealth to determine if auth config is set up properly
func (c *conn) Ping(ctx context.Context) error {
	rows, err := c.QueryContext(ctx, "SELECT 1", []driver.NamedValue{})
	if err != nil {
		return err
	}
	defer rows.Close()
	return nil
}

func (c *conn) Begin() (driver.Tx, error) {
	return nil, fmt.Errorf("athena driver doesn't support begin statements")
}

func (c *conn) Prepare(query string) (driver.Stmt, error) {
	return nil, fmt.Errorf("athena driver doesn't support prepared statements")
}

func (c *conn) Close() error {
	c.closed = true
	return nil
}

func (c *conn) ListDataCatalogs(ctx context.Context) ([]string, error) {
	client, err := c.GetAthenaClient()
	if err != nil {
		return nil, err
	}
	res := []string{}
	nextToken := aws.String("")
	for nextToken != nil {
		out, err := client.ListDataCatalogsWithContext(ctx, &athena.ListDataCatalogsInput{})
		if err != nil {
			return nil, err
		}
		nextToken = out.NextToken
		for _, cat := range out.DataCatalogsSummary {
			res = append(res, *cat.CatalogName)
		}
	}
	return res, nil
}
