module github.com/grafana/athena-datasource

go 1.16

require (
	github.com/aws/aws-sdk-go v1.37.32
	github.com/grafana/grafana-aws-sdk v0.7.0
	github.com/grafana/grafana-plugin-sdk-go v0.114.0
	github.com/grafana/sqlds/v2 v2.3.2
	github.com/pkg/errors v0.9.1
	github.com/uber/athenadriver v1.1.14-0.20210910155546-e1e4a4cd6895
	gotest.tools v2.2.0+incompatible
)

replace github.com/grafana/grafana-aws-sdk => ../grafana-aws-sdk
replace github.com/grafana/sqlds/v2 => ../sqlds
