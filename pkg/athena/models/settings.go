package models

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sqlds/v2"
)

var (
	defaultResultReuseEnabled         = false
	defaultResultReuseMaxAgeInMinutes = int64(60)
)

type AthenaDataSourceSettings struct {
	awsds.AWSDatasourceSettings
	Config                     backend.DataSourceInstanceSettings
	Database                   string `json:"Database"`
	Catalog                    string `json:"Catalog"`
	WorkGroup                  string `json:"WorkGroup"`
	OutputLocation             string `json:"OutputLocation"`
	ResultReuseEnabled         bool   `json:"ResultReuseEnabled"`
	ResultReuseMaxAgeInMinutes int64  `json:"ResultReuseMaxAgeInMinutes"`
}

func New() models.Settings {
	return &AthenaDataSourceSettings{}
}

func (s *AthenaDataSourceSettings) Load(config backend.DataSourceInstanceSettings) error {
	if config.JSONData != nil && len(config.JSONData) > 1 {
		if err := json.Unmarshal(config.JSONData, s); err != nil {
			return fmt.Errorf("could not unmarshal DatasourceSettings json: %w", err)
		}
	}

	s.AccessKey = config.DecryptedSecureJSONData["accessKey"]
	s.SecretKey = config.DecryptedSecureJSONData["secretKey"]

	s.Config = config

	return nil
}

func (s *AthenaDataSourceSettings) Apply(args sqlds.Options) {
	region, catalog, database, resultReuseEnabledString, resultReuseMaxAgeInMinutesString := args["region"], args["catalog"], args["database"], args["resultReuseEnabled"], args["resultReuseMaxAgeInMinutes"]
	if region != "" {
		if region == models.DefaultKey {
			s.Region = s.DefaultRegion
		} else {
			s.Region = region
		}
	}

	if catalog != "" && catalog != models.DefaultKey {
		s.Catalog = catalog
	}

	if database != "" && database != models.DefaultKey {
		s.Database = database
	}

	if resultReuseEnabled, err := strconv.ParseBool(resultReuseEnabledString); err != nil {
		s.ResultReuseEnabled = defaultResultReuseEnabled
	} else {
		s.ResultReuseEnabled = resultReuseEnabled
	}

	if s.ResultReuseEnabled {
		if resultReuseMaxAgeInMinutes, err := strconv.ParseInt(resultReuseMaxAgeInMinutesString, 10, 64); err != nil {
			s.ResultReuseMaxAgeInMinutes = defaultResultReuseMaxAgeInMinutes
		} else {
			s.ResultReuseMaxAgeInMinutes = resultReuseMaxAgeInMinutes
		}
	}
}
