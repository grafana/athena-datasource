package routes

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/grafana/athena-datasource/pkg/athena"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

// regions from https://docs.aws.amazon.com/general/latest/gr/athena.html
var standardRegions = []string{
	"af-south-1",
	"ap-east-1",
	"ap-northeast-1",
	"ap-northeast-2",
	"ap-northeast-3",
	"ap-south-1",
	"ap-southeast-1",
	"ap-southeast-2",
	"ca-central-1",
	"eu-central-1",
	"eu-north-1",
	"eu-south-1",
	"eu-west-1",
	"eu-west-2",
	"eu-west-3",
	"me-south-1",
	"sa-east-1",
	"us-east-1",
	"us-east-2",
	"us-gov-east-1",
	"us-gov-west-1",
	"us-west-1",
	"us-west-2",
}

type ResourceHandler struct {
	ds *athena.AthenaDatasource
}

type reqBody struct {
	Region  string `json:"region"`
	Catalog string `json:"catalog,omitempty"`
}

func New(ds *athena.AthenaDatasource) *ResourceHandler {
	return &ResourceHandler{ds: ds}
}

func write(rw http.ResponseWriter, b []byte) {
	_, err := rw.Write(b)
	if err != nil {
		log.DefaultLogger.Error(err.Error())
	}
}

func parseBody(body io.ReadCloser) (*reqBody, error) {
	reqBody := &reqBody{}
	b, err := ioutil.ReadAll(body)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, reqBody)
	if err != nil {
		return nil, err
	}
	return reqBody, nil
}

func sendResponse(res interface{}, err error, rw http.ResponseWriter) {
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		write(rw, []byte(err.Error()))
		return
	}
	bytes, err := json.Marshal(res)
	if err != nil {
		log.DefaultLogger.Error(err.Error())
		rw.WriteHeader(http.StatusInternalServerError)
		write(rw, []byte(err.Error()))
		return
	}
	rw.Header().Add("Content-Type", "application/json")
	write(rw, bytes)
}

func (r *ResourceHandler) regions(rw http.ResponseWriter, _ *http.Request) {
	// TODO: Replace with a resolved list of regions
	sendResponse(standardRegions, nil, rw)
}

func (r *ResourceHandler) catalogs(rw http.ResponseWriter, req *http.Request) {
	reqBody, err := parseBody(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		write(rw, []byte(err.Error()))
		return
	}
	res, err := r.ds.DataCatalogs(req.Context(), reqBody.Region)
	sendResponse(res, err, rw)
}

func (r *ResourceHandler) databases(rw http.ResponseWriter, req *http.Request) {
	reqBody, err := parseBody(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		write(rw, []byte(err.Error()))
		return
	}
	res, err := r.ds.Databases(req.Context(), reqBody.Region, reqBody.Catalog)
	sendResponse(res, err, rw)
}

func (r *ResourceHandler) workgroups(rw http.ResponseWriter, req *http.Request) {
	reqBody, err := parseBody(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		write(rw, []byte(err.Error()))
		return
	}
	res, err := r.ds.Workgroups(req.Context(), reqBody.Region)
	sendResponse(res, err, rw)
}

func (r *ResourceHandler) Routes() map[string]func(http.ResponseWriter, *http.Request) {
	return map[string]func(http.ResponseWriter, *http.Request){
		"/regions":    r.regions,
		"/catalogs":   r.catalogs,
		"/databases":  r.databases,
		"/workgroups": r.workgroups,
	}
}
