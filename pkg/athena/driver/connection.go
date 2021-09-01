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
	"github.com/jpillora/backoff"
)

var (
	backoffMin = 200 * time.Millisecond
	backoffMax = 10 * time.Minute
)

type conn struct {
	athenaCli athenaiface.AthenaAPI
	settings  *models.AthenaDataSourceSettings
	closed    bool
}

func newConnection(athenaCli athenaiface.AthenaAPI, settings *models.AthenaDataSourceSettings) *conn {
	return &conn{
		athenaCli: athenaCli,
		settings:  settings,
	}
}

func (c *conn) QueryContext(ctx context.Context, query string, _ []driver.NamedValue) (driver.Rows, error) {
	executionResult, err := c.athenaCli.StartQueryExecutionWithContext(ctx, &athena.StartQueryExecutionInput{
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

	if err := c.waitOnQuery(ctx, *executionResult.QueryExecutionId); err != nil {
		return nil, err
	}

	return newRows(c.athenaCli, *executionResult.QueryExecutionId)
}

// waitOnQuery polls the athena api until the query finishes, returning an error if it failed.
func (c *conn) waitOnQuery(ctx context.Context, queryID string) error {
	backoffInstance := backoff.Backoff{
		Min:    backoffMin,
		Max:    backoffMax,
		Factor: 2,
	}
	for {
		statusResp, err := c.athenaCli.GetQueryExecutionWithContext(ctx, &athena.GetQueryExecutionInput{
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
		case <-time.After(backoffInstance.Duration()):
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
