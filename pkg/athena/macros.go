package athena

import (
	"fmt"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/gtime"
	"github.com/grafana/sqlds/v2"
	"github.com/pkg/errors"
)

const (
	timestampFormat   = "'yyyy-MM-dd HH:mm:ss'"
	goTimestampFormat = "2006-01-02 15:04:05"
)

func parseTime(target, format string) string {
	if format == "" {
		return target
	} else if format == timestampFormat {
		return fmt.Sprintf("TIMESTAMP %s", target)
	}
	return fmt.Sprintf("parse_datetime(%s,%s)", target, format)
}

func parseTimeGroup(query *sqlds.Query, args []string) (time.Duration, string, error) {
	if len(args) < 2 {
		return 0, "", errors.WithMessagef(sqlds.ErrorBadArgumentCount, "macro $__timeGroup needs time column and interval")
	}

	interval, err := gtime.ParseInterval(strings.Trim(args[1], `'`))
	if err != nil {
		return 0, "", fmt.Errorf("error parsing interval %v", args[1])
	}

	timeVar := args[0]
	if len(args) == 3 {
		timeVar = parseTime(args[0], args[2])
	}

	return interval, timeVar, nil
}

func macroTimeGroup(query *sqlds.Query, args []string) (string, error) {
	interval, timeVar, err := parseTimeGroup(query, args)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("FROM_UNIXTIME(FLOOR(TO_UNIXTIME(%s)/%v)*%v)", timeVar, interval.Seconds(), interval.Seconds()), nil
}

func macroUnixEpochGroup(query *sqlds.Query, args []string) (string, error) {
	interval, timeVar, err := parseTimeGroup(query, args)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("FROM_UNIXTIME(FLOOR(%s/%v)*%v)", timeVar, interval.Seconds(), interval.Seconds()), nil
}

func macroParseTime(query *sqlds.Query, args []string) (string, error) {
	if len(args) < 1 {
		return "", errors.WithMessagef(sqlds.ErrorBadArgumentCount, "expected at least one argument")
	}

	var (
		column     = args[0]
		timeFormat = timestampFormat
	)

	if len(args) == 2 {
		timeFormat = args[1]
	}

	return parseTime(column, timeFormat), nil
}

func macroTimeFilter(query *sqlds.Query, args []string) (string, error) {
	if len(args) < 1 {
		return "", errors.WithMessagef(sqlds.ErrorBadArgumentCount, "expected at least one argument")
	}

	var (
		column     = args[0]
		timeFormat = ""
		from       = query.TimeRange.From.Format(goTimestampFormat)
		to         = query.TimeRange.To.Format(goTimestampFormat)
	)

	if len(args) > 1 {
		timeFormat = args[1]
	}
	timeVar := parseTime(column, timeFormat)

	return fmt.Sprintf("%s BETWEEN TIMESTAMP '%s' AND TIMESTAMP '%s'", timeVar, from, to), nil
}

func macroUnixEpochFilter(query *sqlds.Query, args []string) (string, error) {
	if len(args) != 1 {
		return "", errors.WithMessagef(sqlds.ErrorBadArgumentCount, "expected one argument")
	}

	var (
		column = args[0]
		from   = query.TimeRange.From.UTC().Unix()
		to     = query.TimeRange.To.UTC().Unix()
	)

	return fmt.Sprintf("%s BETWEEN %d AND %d", column, from, to), nil
}

func macroTimeFrom(query *sqlds.Query, args []string) (string, error) {
	return fmt.Sprintf("TIMESTAMP '%s'", query.TimeRange.From.UTC().Format(goTimestampFormat)), nil

}

func macroTimeTo(query *sqlds.Query, args []string) (string, error) {
	return fmt.Sprintf("TIMESTAMP '%s'", query.TimeRange.To.UTC().Format(goTimestampFormat)), nil
}

func macroDateFilter(query *sqlds.Query, args []string) (string, error) {
	if len(args) != 1 {
		return "", errors.WithMessagef(sqlds.ErrorBadArgumentCount, "expected 1 argument, received %d", len(args))
	}

	var (
		column = args[0]
		from   = query.TimeRange.From.UTC().Format("2006-01-02")
		to     = query.TimeRange.To.UTC().Format("2006-01-02")
	)

	return fmt.Sprintf("%s BETWEEN date '%s' AND date '%s'", column, from, to), nil
}

var macros = map[string]sqlds.MacroFunc{
	"dateFilter":      macroDateFilter,
	"parseTime":       macroParseTime,
	"unixEpochFilter": macroUnixEpochFilter,
	"timeFilter":      macroTimeFilter,
	"timeFrom":        macroTimeFrom,
	"timeGroup":       macroTimeGroup,
	"unixEpochGroup":  macroUnixEpochGroup,
	"timeTo":          macroTimeTo,
}

func (s *AthenaDatasource) Macros() sqlds.Macros {
	return macros
}
