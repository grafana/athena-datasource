package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

const DefaultKey = "__default"

type AthenaDataSourceSettings struct {
	awsds.AWSDatasourceSettings
	Database  string `json:"Database"`
	Catalog   string `json:"Catalog"`
	WorkGroup string `json:"WorkGroup"`
}

func (s *AthenaDataSourceSettings) Load(config backend.DataSourceInstanceSettings) error {
	if config.JSONData != nil && len(config.JSONData) > 1 {
		if err := json.Unmarshal(config.JSONData, s); err != nil {
			return fmt.Errorf("could not unmarshal DatasourceSettings json: %w", err)
		}
	}

	s.AccessKey = config.DecryptedSecureJSONData["accessKey"]
	s.SecretKey = config.DecryptedSecureJSONData["secretKey"]

	return nil
}

func (s *AthenaDataSourceSettings) GetConnectionKey(id int64, region, catalog, database string) string {
	regionKey := DefaultKey
	catalogKey := DefaultKey
	databaseKey := DefaultKey
	if region != "" && region != s.DefaultRegion {
		regionKey = region
	}
	if catalog != "" && catalog != s.Catalog {
		catalogKey = catalog
	}
	if database != "" && database != s.Database {
		databaseKey = database
	}
	return fmt.Sprintf("%d-%s-%s-%s", id, regionKey, catalogKey, databaseKey)
}
