package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

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

func (s *AthenaDataSourceSettings) GetConnectionKey(region, catalog string) string {
	regionKey := "default"
	catalogKey := "default"
	if region != "" && region != s.DefaultRegion {
		regionKey = region
	}
	if catalog != "" && catalog != s.Catalog {
		catalogKey = catalog
	}
	return fmt.Sprintf("%s-%s", regionKey, catalogKey)
}
