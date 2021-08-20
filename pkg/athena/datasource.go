package athena

import (
	"context"
	"database/sql"
	"fmt"
	"reflect"

	"github.com/grafana/athena-datasource/pkg/athena/driver"
	"github.com/grafana/athena-datasource/pkg/athena/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/pkg/errors"
)

type AthenaDatasource struct {
	db *sql.DB
}

func (s *AthenaDatasource) FillMode() *data.FillMissing {
	return &data.FillMissing{
		Mode: data.FillModeNull,
	}
}

// Connect opens a sql.DB connection using datasource settings
func (s *AthenaDatasource) Connect(config backend.DataSourceInstanceSettings) (*sql.DB, error) {
	settings := models.AthenaDataSourceSettings{}
	err := settings.Load(config)
	if err != nil {
		return nil, fmt.Errorf("error reading settings: %s", err.Error())
	}

	db, err := driver.Open(settings)
	if err != nil {
		return nil, errors.WithMessage(err, "Failed to connect to database. Is the hostname and port correct?")
	}
	s.db = db

	return db, nil
}

func (s *AthenaDatasource) Converters() (sc []sqlutil.Converter) {
	return []sqlutil.Converter{{ // This converter can be removed as soon as it's a part of SQLUtil. See https://github.com/grafana/grafana-plugin-sdk-go/pull/369
		Name:          "nullable bool converter",
		InputScanType: reflect.TypeOf(sql.NullBool{}),
		InputTypeName: "BOOLEAN",
		FrameConverter: sqlutil.FrameConverter{
			FieldType: data.FieldTypeNullableBool,
			ConverterFunc: func(n interface{}) (interface{}, error) {
				v := n.(*sql.NullBool)

				if !v.Valid {
					return (*bool)(nil), nil
				}

				return &v.Bool, nil
			},
		},
	}}
}

func (s *AthenaDatasource) Schemas(ctx context.Context) ([]string, error) {
	// TBD
	return []string{}, nil
}

func (s *AthenaDatasource) Tables(ctx context.Context, schema string) ([]string, error) {
	// TBD
	return []string{}, nil
}

func (s *AthenaDatasource) Columns(ctx context.Context, table string) ([]string, error) {
	// TBD
	return []string{}, nil
}
