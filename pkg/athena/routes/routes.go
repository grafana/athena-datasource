package routes

import (
	"encoding/json"
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

type catalogReqBody struct {
	Region string `json:"region"`
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

func (r *ResourceHandler) regions(rw http.ResponseWriter, _ *http.Request) {
	rw.Header().Add("Content-Type", "application/json")
	// TODO: Replace with a resolved list of regions
	res, err := json.Marshal(standardRegions)
	if err != nil {
		log.DefaultLogger.Error(err.Error())
		rw.WriteHeader(http.StatusInternalServerError)
		write(rw, []byte(err.Error()))
		return
	}
	write(rw, res)
}

func (r *ResourceHandler) catalogs(rw http.ResponseWriter, req *http.Request) {
	b, err := ioutil.ReadAll(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		write(rw, []byte(err.Error()))
		return
	}
	reqBody := catalogReqBody{}
	err = json.Unmarshal(b, &reqBody)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		write(rw, []byte(err.Error()))
		return
	}
	res, err := r.ds.DataCatalogs(req.Context(), reqBody.Region)
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

func (r *ResourceHandler) Routes() map[string]func(http.ResponseWriter, *http.Request) {
	return map[string]func(http.ResponseWriter, *http.Request){
		"/regions":  r.regions,
		"/catalogs": r.catalogs,
	}
}
