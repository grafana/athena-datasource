package athena

import (
	"fmt"

	"github.com/grafana/sqlds/v2"
	"github.com/pkg/errors"
)

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
	"dateFilter": macroDateFilter,
}

func (s *AthenaDatasource) Macros() sqlds.Macros {
	return macros
}
