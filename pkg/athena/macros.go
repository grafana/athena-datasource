package athena

import (
	"github.com/grafana/sqlds"
)

var macros = map[string]sqlds.MacroFunc{}

func (s *AthenaDatasource) Macros() sqlds.Macros {
	return macros
}
