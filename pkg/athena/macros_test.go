package athena

import (
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sqlds/v2"
	"github.com/pkg/errors"
)

func Test_macros(t *testing.T) {
	tests := []struct {
		description string
		macro       string
		query       *sqlds.Query
		args        []string
		expected    string
		expectedErr error
	}{
		{
			"time group",
			"timeGroup",
			&sqlds.Query{},
			[]string{"starttime", "'1m'"},
			`FROM_UNIXTIME(FLOOR(TO_UNIXTIME(starttime)/60)*60)`,
			nil,
		},
		{
			"time group parsing time",
			"timeGroup",
			&sqlds.Query{},
			[]string{"starttime", "'1m'", "'yyyy-MM-dd HH:mm:ss'"},
			`FROM_UNIXTIME(FLOOR(TO_UNIXTIME(TIMESTAMP starttime)/60)*60)`,
			nil,
		},
		{
			"time group parsing custom time",
			"timeGroup",
			&sqlds.Query{},
			[]string{"starttime", "'1m'", "'yyyy-MM-dd'T'HH:mm:ss''Z'"},
			`FROM_UNIXTIME(FLOOR(TO_UNIXTIME(parse_datetime(starttime,'yyyy-MM-dd'T'HH:mm:ss''Z'))/60)*60)`,
			nil,
		},
		{
			"wrong args for time group",
			"timeGroup",
			&sqlds.Query{},
			[]string{},
			"",
			sqlds.ErrorBadArgumentCount,
		},
		{
			"parse time",
			"parseTime",
			&sqlds.Query{},
			[]string{"starttime", "'yyyy-MM-dd HH:mm:ss'"},
			`TIMESTAMP starttime`,
			nil,
		},
		{
			"time filter without format",
			"timeFilter",
			&sqlds.Query{
				TimeRange: backend.TimeRange{
					From: time.Date(2021, 6, 23, 0, 0, 0, 0, &time.Location{}),
					To:   time.Date(2021, 6, 23, 1, 0, 0, 0, &time.Location{}),
				},
			},
			[]string{"starttime"},
			`starttime BETWEEN TIMESTAMP '2021-06-23 00:00:00' AND TIMESTAMP '2021-06-23 01:00:00'`,
			nil,
		},
		{
			"time filter with default format",
			"timeFilter",
			&sqlds.Query{
				TimeRange: backend.TimeRange{
					From: time.Date(2021, 6, 23, 0, 0, 0, 0, &time.Location{}),
					To:   time.Date(2021, 6, 23, 1, 0, 0, 0, &time.Location{}),
				},
			},
			[]string{"starttime", "'yyyy-MM-dd HH:mm:ss'"},
			`TIMESTAMP starttime BETWEEN TIMESTAMP '2021-06-23 00:00:00' AND TIMESTAMP '2021-06-23 01:00:00'`,
			nil,
		},
		{
			"time filter with a custom format",
			"timeFilter",
			&sqlds.Query{
				TimeRange: backend.TimeRange{
					From: time.Date(2021, 6, 23, 0, 0, 0, 0, &time.Location{}),
					To:   time.Date(2021, 6, 23, 1, 0, 0, 0, &time.Location{}),
				},
			},
			[]string{"starttime", "'yyyy-MM-dd''T''HH:mm:ss''+0000'"},
			`parse_datetime(starttime,'yyyy-MM-dd''T''HH:mm:ss''+0000') BETWEEN TIMESTAMP '2021-06-23 00:00:00' AND TIMESTAMP '2021-06-23 01:00:00'`,
			nil,
		},
		{
			"wrong args for time filter",
			"timeFilter",
			&sqlds.Query{},
			[]string{},
			"",
			sqlds.ErrorBadArgumentCount,
		},
		{
			"time from filter",
			"timeFrom",
			&sqlds.Query{
				TimeRange: backend.TimeRange{
					From: time.Date(2021, 6, 23, 0, 0, 0, 0, &time.Location{}),
					To:   time.Date(2021, 6, 23, 1, 0, 0, 0, &time.Location{}),
				},
			},
			[]string{},
			`TIMESTAMP '2021-06-23 00:00:00'`,
			nil,
		},
		{
			"time to filter",
			"timeTo",
			&sqlds.Query{
				TimeRange: backend.TimeRange{
					From: time.Date(2021, 6, 23, 0, 0, 0, 0, &time.Location{}),
					To:   time.Date(2021, 6, 23, 1, 0, 0, 0, &time.Location{}),
				},
			},
			[]string{},
			`TIMESTAMP '2021-06-23 01:00:00'`,
			nil,
		},
		{
			"unix time filter",
			"unixEpochFilter",
			&sqlds.Query{
				TimeRange: backend.TimeRange{
					From: time.Date(2021, 6, 23, 0, 0, 0, 0, &time.Location{}),
					To:   time.Date(2021, 6, 23, 1, 0, 0, 0, &time.Location{}),
				},
			},
			[]string{"time"},
			`time BETWEEN 1624406400 AND 1624410000`,
			nil,
		},
		{
			"unix time group filter",
			"unixEpochGroup",
			&sqlds.Query{
				TimeRange: backend.TimeRange{
					From: time.Date(2021, 6, 23, 0, 0, 0, 0, &time.Location{}),
					To:   time.Date(2021, 6, 23, 1, 0, 0, 0, &time.Location{}),
				},
			},
			[]string{"time", "5m"},
			`FROM_UNIXTIME(FLOOR(time/300)*300)`,
			nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			res, err := macros[tt.macro](tt.query, tt.args)
			if (err != nil || tt.expectedErr != nil) && !errors.Is(err, tt.expectedErr) {
				t.Errorf("unexpected error %v, expecting %v", err, tt.expectedErr)
			}
			if res != tt.expected {
				t.Errorf("unexpected result %v, expecting %v", res, tt.expected)
			}
		})
	}
}
