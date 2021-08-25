package athena

import (
	"github.com/grafana/sqlds/v2"
)

var macros = map[string]sqlds.MacroFunc{}

func (s *AthenaDatasource) Macros() sqlds.Macros {
	return macros
}
