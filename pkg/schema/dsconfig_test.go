package schema_test

import (
	_ "embed"
	"testing"

	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/dsconfig/schema"
)

//go:embed dsconfig.json
var configSchemaJSON []byte

// settingsJSONModel shadows AssumeRoleARN with the lower-camel-case tag the
// schema declares and the config editor round-trips (jsonData.assumeRoleArn),
// rather than the upstream awsds struct tag (jsonData.assumeRoleARN). Both
// spellings load correctly at runtime since encoding/json falls back to a
// case-insensitive tag match, and jsonTagFields gives outer fields priority
// over the ones they shadow from the embedded struct, so this only changes
// which spelling the conformance check compares against.
type settingsJSONModel struct {
	models.AthenaDataSourceSettings
	AssumeRoleARN string `json:"assumeRoleArn"`
}

//go:generate go test -run TestPlugin -generateArtifacts
func TestPlugin(t *testing.T) {
	schema.RunPluginTests(t, schema.PluginUnderTest{
		ID:                "grafana-athena-datasource",
		ConfigSchemaJSON:  configSchemaJSON,
		SettingsJSONModel: settingsJSONModel{},
		SecureKeys:        []string{"accessKey", "secretKey", "sessionToken", "proxyPassword"},
	})
}
