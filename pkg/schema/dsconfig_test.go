package schema_test

import (
	_ "embed"
	"testing"

	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/dsconfig/schema"
)

//go:embed dsconfig.json
var configSchemaJSON []byte

//go:generate go test -run TestPlugin -generateArtifacts
func TestPlugin(t *testing.T) {
	schema.RunPluginTests(t, schema.PluginUnderTest{
		ID:                "grafana-athena-datasource",
		ConfigSchemaJSON:  configSchemaJSON,
		SettingsJSONModel: models.AthenaDataSourceSettings{},
		SecureKeys:        []string{"accessKey", "secretKey", "sessionToken", "proxyPassword"},
	})
}
