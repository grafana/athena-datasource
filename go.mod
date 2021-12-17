module github.com/grafana/athena-datasource

go 1.16

require (
	github.com/aws/aws-sdk-go v1.37.32
	github.com/google/go-cmp v0.5.6
	// TODO: Replace with final version when ready
	github.com/grafana/grafana-aws-sdk v0.7.1-0.20211215150526-39abfdfc63c2
	github.com/grafana/grafana-plugin-sdk-go v0.114.0
	github.com/grafana/sqlds/v2 v2.3.3
	github.com/jpillora/backoff v1.0.0
	github.com/pkg/errors v0.9.1
	github.com/uber/athenadriver v1.1.14-0.20210910155546-e1e4a4cd6895
	gotest.tools v2.2.0+incompatible
)
