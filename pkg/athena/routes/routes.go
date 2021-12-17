package routes

import (
	"net/http"

	"github.com/grafana/athena-datasource/pkg/athena"
	"github.com/grafana/grafana-aws-sdk/pkg/sql/routes"
)

type AthenaResourceHandler struct {
	routes.ResourceHandler
	athena athena.AthenaDatasourceIface
}

func New(api athena.AthenaDatasourceIface) *AthenaResourceHandler {
	return &AthenaResourceHandler{routes.ResourceHandler{API: api}, api}
}

func (r *AthenaResourceHandler) catalogs(rw http.ResponseWriter, req *http.Request) {
	reqBody, err := routes.ParseBody(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		routes.Write(rw, []byte(err.Error()))
		return
	}
	res, err := r.athena.DataCatalogs(req.Context(), reqBody)
	routes.SendResources(rw, res, err)
}

func (r *AthenaResourceHandler) workgroups(rw http.ResponseWriter, req *http.Request) {
	reqBody, err := routes.ParseBody(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		routes.Write(rw, []byte(err.Error()))
		return
	}
	res, err := r.athena.Workgroups(req.Context(), reqBody)
	routes.SendResources(rw, res, err)
}

func (r *AthenaResourceHandler) Routes() map[string]func(http.ResponseWriter, *http.Request) {
	routes := r.DefaultRoutes()
	routes["/catalogs"] = r.catalogs
	routes["/workgroups"] = r.workgroups
	return routes
}
