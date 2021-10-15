package routes

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/athena-datasource/pkg/athena/fake"
)

var ds = &fake.AthenaFakeDatasource{
	Resources: map[string]map[string][]string{
		"us-east-2": {
			"catalog": []string{"db1", "db2"},
		},
	},
	Wg: map[string][]string{
		"us-east-2": {"wg1", "wg2"},
	},
	ExistingTables: map[string]map[string]map[string][]string{
		"us-east-2": {
			"catalog": {
				"database": []string{"tb1", "tb2"},
			},
		},
	},
	ExistingColumns: map[string]map[string]map[string]map[string][]string{
		"us-east-2": {
			"catalog": {
				"database": {
					"table": []string{"c1", "c2"},
				},
			},
		},
	},
}

func TestRoutes(t *testing.T) {
	standardRegionsBytes, err := json.Marshal(standardRegions)
	if err != nil {
		panic(err)
	}
	tests := []struct {
		description    string
		route          string
		reqBody        []byte
		expectedCode   int
		expectedResult string
	}{
		{
			description:    "return default regions",
			route:          "regions",
			reqBody:        nil,
			expectedCode:   http.StatusOK,
			expectedResult: string(standardRegionsBytes),
		},
		{
			description:  "wrong req body for catalogs",
			route:        "catalogs",
			reqBody:      []byte{},
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "default catalogs",
			route:          "catalogs",
			reqBody:        []byte(`{"region":"us-east-2"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["catalog"]`,
		},
		{
			description:  "wrong region for catalogs",
			route:        "catalogs",
			reqBody:      []byte(`{"region":"us-east-3"}`),
			expectedCode: http.StatusBadRequest,
		},
		{
			description:  "wrong req body for databases",
			route:        "databases",
			reqBody:      []byte{},
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "default databases",
			route:          "databases",
			reqBody:        []byte(`{"region":"us-east-2","catalog":"catalog"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["db1","db2"]`,
		},
		{
			description:  "wrong region for databases",
			route:        "databases",
			reqBody:      []byte(`{"region":"us-east-3"}`),
			expectedCode: http.StatusBadRequest,
		},
		{
			description:  "wrong req body for workgroups",
			route:        "workgroups",
			reqBody:      []byte{},
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "default workgroups",
			route:          "workgroups",
			reqBody:        []byte(`{"region":"us-east-2"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["wg1","wg2"]`,
		},
		{
			description:  "wrong region for workgroups",
			route:        "workgroups",
			reqBody:      []byte(`{"region":"us-east-3"}`),
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "tables with connection details",
			route:          "tablesWithConnectionDetails",
			reqBody:        []byte(`{"region":"us-east-2","catalog":"catalog","database":"database"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["tb1","tb2"]`,
		},
		{
			description:    "columns with connection details",
			route:          "columnsWithConnectionDetails",
			reqBody:        []byte(`{"region":"us-east-2","catalog":"catalog","database":"database","table":"table"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["c1","c2"]`,
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			req := httptest.NewRequest("GET", "http://example.com/foo", bytes.NewReader(tt.reqBody))
			rw := httptest.NewRecorder()
			rh := ResourceHandler{ds: ds}
			switch tt.route {
			case "regions":
				rh.regions(rw, req)
			case "catalogs":
				rh.catalogs(rw, req)
			case "databases":
				rh.databases(rw, req)
			case "workgroups":
				rh.workgroups(rw, req)
			case "tablesWithConnectionDetails":
				rh.tablesWithConnectionDetails(rw, req)
			case "columnsWithConnectionDetails":
				rh.columnsWithConnectionDetails(rw, req)
			default:
				t.Fatalf("unexpected route %s", tt.route)
			}

			resp := rw.Result()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != tt.expectedCode {
				t.Errorf("expecting code %v got %v", tt.expectedCode, resp.StatusCode)
			}
			if resp.StatusCode == http.StatusOK && !cmp.Equal(string(body), tt.expectedResult) {
				t.Errorf("unexpected response: %v", cmp.Diff(string(body), tt.expectedResult))
			}
		})
	}
}
