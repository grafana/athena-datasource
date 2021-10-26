package driver

import (
	"context"
	"database/sql/driver"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/athena"
	"github.com/grafana/athena-datasource/pkg/athena/api"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/jpillora/backoff"
)

var (
	backoffMin = 200 * time.Millisecond
	backoffMax = 10 * time.Minute
)

type conn struct {
	api    *api.API
	closed bool
}

func newConnection(api *api.API) *conn {
	return &conn{
		api: api,
	}
}

func (c *conn) QueryContext(ctx context.Context, query string, _ []driver.NamedValue) (driver.Rows, error) {
	executionResult, err := c.api.Execute(ctx, query)
	if err != nil {
		return nil, err
	}

	if err := c.waitOnQuery(ctx, *executionResult.QueryExecutionId); err != nil {
		return nil, err
	}

	return NewRows(ctx, c.api.Client, *executionResult.QueryExecutionId)
}

// waitOnQuery polls the athena api until the query finishes, returning an error if it failed.
func (c *conn) waitOnQuery(ctx context.Context, queryID string) error {
	backoffInstance := backoff.Backoff{
		Min:    backoffMin,
		Max:    backoffMax,
		Factor: 2,
	}
	for {
		statusResp, err := c.api.Client.GetQueryExecutionWithContext(ctx, &athena.GetQueryExecutionInput{
			QueryExecutionId: aws.String(queryID),
		})
		if err != nil {
			return err
		}

		switch *statusResp.QueryExecution.Status.State {
		case athena.QueryExecutionStateFailed:
			reason := *statusResp.QueryExecution.Status.StateChangeReason
			log.DefaultLogger.Debug("request failed", "query ID", queryID, "reason", reason)
			return errors.New(reason)
		case athena.QueryExecutionStateSucceeded:
			return nil
		}

		select {
		case <-ctx.Done():
			err := ctx.Err()
			if errors.Is(err, context.Canceled) {
				_, err := c.api.Client.StopQueryExecution(&athena.StopQueryExecutionInput{
					QueryExecutionId: aws.String(queryID),
				})
				if err != nil {
					return fmt.Errorf("%w: unable to stop query", err)
				}
			}
			log.DefaultLogger.Debug("request failed", "query ID", queryID, "error", err)
			return err
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
