package routes

import (
	"bytes"
	"context"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/grafana/athena-datasource/pkg/athena/fake"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/stretchr/testify/require"
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
	WgEngineVersion: map[string]string{
		"wg1": "Athena engine version 3",
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
	tests := []struct {
		description    string
		route          string
		reqBody        []byte
		expectedCode   int
		expectedResult string
	}{
		{
			description:    "return default regions",
			route:          "/regions",
			reqBody:        nil,
			expectedCode:   http.StatusOK,
			expectedResult: string("[]"),
		},
		{
			description:  "wrong req body for catalogs",
			route:        "/catalogs",
			reqBody:      []byte{},
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "default catalogs",
			route:          "/catalogs",
			reqBody:        []byte(`{"region":"us-east-2"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["catalog"]`,
		},
		{
			description:  "wrong region for catalogs",
			route:        "/catalogs",
			reqBody:      []byte(`{"region":"us-east-3"}`),
			expectedCode: http.StatusBadRequest,
		},
		{
			description:  "wrong req body for databases",
			route:        "/databases",
			reqBody:      []byte{},
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "default databases",
			route:          "/databases",
			reqBody:        []byte(`{"region":"us-east-2","catalog":"catalog"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["db1","db2"]`,
		},
		{
			description:  "wrong region for databases",
			route:        "/databases",
			reqBody:      []byte(`{"region":"us-east-3"}`),
			expectedCode: http.StatusBadRequest,
		},
		{
			description:  "wrong req body for workgroups",
			route:        "/workgroups",
			reqBody:      []byte{},
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "default workgroups",
			route:          "/workgroups",
			reqBody:        []byte(`{"region":"us-east-2"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `["wg1","wg2"]`,
		},
		{
			description:  "wrong region for workgroups",
			route:        "/workgroups",
			reqBody:      []byte(`{"region":"us-east-3"}`),
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "workgroup engine version",
			route:          "/workgroupEngineVersion",
			reqBody:        []byte(`{"workgroup":"wg1"}`),
			expectedCode:   http.StatusOK,
			expectedResult: `"Athena engine version 3"`,
		},
		{
			description:  "workgroup engine version missing workgroup",
			route:        "/workgroupEngineVersion",
			reqBody:      []byte{},
			expectedCode: http.StatusBadRequest,
		},
		{
			description:    "externalId",
			route:          "/externalId",
			reqBody:        []byte{},
			expectedCode:   http.StatusOK,
			expectedResult: `{"externalId":""}`,
		},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			req := httptest.NewRequest("GET", "http://example.com/foo", bytes.NewReader(tt.reqBody))
			rw := httptest.NewRecorder()
			rh := AthenaResourceHandler{athena: ds}
			rh.API = ds
			rh.Routes()[tt.route](rw, req)
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

func setupHandler() AthenaResourceHandler {
	rh := AthenaResourceHandler{athena: ds}
	rh.API = ds
	return rh
}

func hitRoute(rh AthenaResourceHandler, route string, reqBody []byte, externalId string) (*http.Response, []byte, error) {
	ctx := backend.WithGrafanaConfig(context.Background(), backend.NewGrafanaCfg(map[string]string{
		awsds.GrafanaAssumeRoleExternalIdKeyName: externalId,
	}))
	req := httptest.NewRequestWithContext(ctx, "GET", route, bytes.NewReader(reqBody))
	rw := httptest.NewRecorder()
	rh.Routes()[route](rw, req)
	resp := rw.Result()
	body, err := io.ReadAll(resp.Body)
	return resp, body, err
}
func TestRoutes_ExternalId(t *testing.T) {

	t.Run("it returns an externalId if one is set in the env", func(t *testing.T) {
		rh := setupHandler()
		resp, body, err := hitRoute(rh, "/externalId", []byte{}, "a fake external id")

		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.Equal(t, `{"externalId":"a fake external id"}`, string(body))
	})
	t.Run("it returns an empty string if there is no external id set in the env", func(t *testing.T) {
		rh := setupHandler()
		resp, body, err := hitRoute(rh, "/externalId", []byte{}, "")

		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.Equal(t, `{"externalId":""}`, string(body))
	})

}
