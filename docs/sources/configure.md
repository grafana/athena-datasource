---
aliases:
  - /docs/plugins/grafana-athena-datasource/configure/
description: Configure the Amazon Athena data source for Grafana.
keywords:
  - grafana
  - amazon athena
  - athena
  - aws
  - configure
  - authentication
  - iam
  - provisioning
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Configure
title: Configure the Amazon Athena data source
weight: 200
last_reviewed: 2026-02-20
---

# Configure the Amazon Athena data source

This document explains how to configure the Amazon Athena data source in Grafana.

## Before you begin

Before you configure the data source, ensure you have the following prerequisites.

- **Grafana permissions:** Organization administrator role.
- **AWS account:** An active AWS account with Amazon Athena enabled.
- **IAM credentials:** An IAM user or role with the required Athena, Glue, and S3 permissions. Refer to the [IAM policies](#iam-policies) section for details.
- **Athena resources:** At least one Athena workgroup and data catalog configured in your AWS account.

## Add the data source

To add the Amazon Athena data source:

1. Click **Connections** in the left-side menu.
1. Click **Add new connection**.
1. Type `Amazon Athena` in the search bar.
1. Select **Amazon Athena**.
1. Click **Add new data source**.

## Configure settings

The following table describes the available configuration settings.

| Setting | Description |
| ------------------------------ | ----------- |
| **Name** | The data source name. This is how you refer to the data source in panels and queries. |
| **Default** | Toggle to make this the default data source for new panels. |
| **Authentication Provider** | The AWS credentials chain to use. Refer to [Authentication](#authentication) for details. |
| **Assume Role ARN** (optional) | The ARN of an IAM role to assume. Use this for cross-account access. |
| **External ID** (optional) | The external ID for assuming a role in another account. Required if the target role was created with an external ID condition. |
| **Endpoint** (optional) | A custom endpoint for the Amazon Athena service. |
| **Default Region** | The AWS region where your Athena resources are located. |
| **Data Source** | The Athena data catalog to use. Catalogs are loaded automatically. |
| **Database** | The database within the selected catalog. |
| **Workgroup** | The Athena workgroup to use for query execution. |
| **Output Location** (optional) | An S3 bucket to store query execution outputs. If not specified, the default query result location from the workgroup configuration is used. If [Override client-side settings](https://docs.aws.amazon.com/athena/latest/ug/workgroups-settings-override.html) is enabled in the AWS console, this setting is ignored. |

## Authentication

The Amazon Athena data source uses AWS authentication. The available authentication methods depend on your Grafana deployment.

Open source Grafana enables the **AWS SDK Default**, **Credentials file**, and **Access and secret key** methods by default. Grafana Cloud enables **Access and secret key** by default.

For more information about authentication options and configuration, refer to [AWS authentication](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/datasources/aws-cloudwatch/aws-authentication/).

### IAM policies

Grafana needs permissions granted through IAM to read Amazon Athena data. You can attach these permissions to IAM roles and use Grafana's built-in support for assuming roles. You must [create the required IAM policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html) before adding the data source to Grafana.

Depending on the data you query with Amazon Athena, you may need different permissions. AWS provides [predefined managed policies](https://docs.aws.amazon.com/athena/latest/ug/managed-policies.html) you can use as a starting point.

The following example shows a minimal IAM policy for querying Amazon Athena. It's based on the [`AmazonAthenaFullAccess`](https://docs.aws.amazon.com/athena/latest/ug/managed-policies.html#amazonathenafullaccess-managed-policy) managed policy, with write permissions removed where possible since Grafana should be used as read-only.

{{< admonition type="note" >}}
Update the ARN of the S3 bucket if you're using a custom one. If your AWS account uses AWS Lake Formation to manage data access, you must also include the `lakeformation:GetDataAccess` permission. Refer to the [AWS Lake Formation permissions for Athena](https://docs.aws.amazon.com/athena/latest/ug/lf-athena.html) documentation.
{{< /admonition >}}

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AthenaQueryAccess",
      "Effect": "Allow",
      "Action": [
        "athena:ListDatabases",
        "athena:ListDataCatalogs",
        "athena:ListWorkGroups",
        "athena:GetDatabase",
        "athena:GetDataCatalog",
        "athena:GetQueryExecution",
        "athena:GetQueryResults",
        "athena:GetTableMetadata",
        "athena:GetWorkGroup",
        "athena:ListTableMetadata",
        "athena:StartQueryExecution",
        "athena:StopQueryExecution"
      ],
      "Resource": ["*"]
    },
    {
      "Sid": "GlueReadAccess",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetPartition",
        "glue:GetPartitions",
        "glue:BatchGetPartition"
      ],
      "Resource": ["*"]
    },
    {
      "Sid": "AthenaS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload",
        "s3:PutObject"
      ],
      "Resource": ["arn:aws:s3:::aws-athena-query-results-*"]
    },
    {
      "Sid": "AthenaExamplesS3Access",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::athena-examples*"]
    },
    {
      "Sid": "LakeFormationAccess",
      "Effect": "Allow",
      "Action": [
        "lakeformation:GetDataAccess"
      ],
      "Resource": ["*"]
    }
  ]
}
```

## Verify the connection

Click **Save & test** to verify that the data source is configured correctly. A success message confirms that Grafana can connect to your Amazon Athena instance.

## Provision the data source

You can define the Amazon Athena data source in YAML files as part of Grafana's provisioning system. For more information, refer to [Provisioning Grafana](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/provisioning/).

The following examples show provisioning configurations for each authentication method.

### Use AWS SDK (default)

```yaml
apiVersion: 1
datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: default
      defaultRegion: eu-west-2
      catalog: AwsDataCatalog
      database: <YOUR_ATHENA_DATABASE>
      workgroup: <YOUR_ATHENA_WORKGROUP>
```

### Use a credentials profile

```yaml
apiVersion: 1
datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: credentials
      defaultRegion: eu-west-2
      profile: secondary
      catalog: AwsDataCatalog
      database: <YOUR_ATHENA_DATABASE>
      workgroup: <YOUR_ATHENA_WORKGROUP>
```

### Use access and secret keys

```yaml
apiVersion: 1
datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: keys
      defaultRegion: eu-west-2
      catalog: AwsDataCatalog
      database: <YOUR_ATHENA_DATABASE>
      workgroup: <YOUR_ATHENA_WORKGROUP>
    secureJsonData:
      accessKey: <YOUR_ACCESS_KEY>
      secretKey: <YOUR_SECRET_KEY>
```

### Use AWS SDK with an assumed IAM role

```yaml
apiVersion: 1
datasources:
  - name: Athena
    type: grafana-athena-datasource
    jsonData:
      authType: default
      assumeRoleArn: arn:aws:iam::123456789012:root
      defaultRegion: eu-west-2
      catalog: AwsDataCatalog
      database: <YOUR_ATHENA_DATABASE>
      workgroup: <YOUR_ATHENA_WORKGROUP>
```

### Optional provisioning parameters

You can also include the following optional parameters in your provisioning configuration.

```yaml
jsonData:
  endpoint: https://<SERVICE>.<REGION>.amazonaws.com
  externalId: <YOUR_ROLE_EXTERNAL_ID>
  outputLocation: s3://<YOUR_S3_BUCKET>
```
