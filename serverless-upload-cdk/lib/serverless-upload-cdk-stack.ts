import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Table, AttributeType, BillingMode, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';
import { get } from 'http';

export class ServerlessUploadCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an S3 bucket for storing uploaded files
    const uploadBucket = new Bucket(this, 'FileUploadBucket', {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // Create a Lambda function for uploading files to S3
    const uploadFunction = new lambda.Function(this, 'uploadFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'upload.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        BUCKET_NAME: uploadBucket.bucketName,
      },
    });

    // Grant the Lambda function permission to put objects in the S3 bucket
    uploadBucket.grantPut(uploadFunction);

    // Create an HTTP API endpoint with API Gateway
    const api = new apigateway.HttpApi(this, 'FileUploadApi');

    // Add a POST route to the API that integrates with the Lambda function
    api.addRoutes({
      path: '/upload',
      methods: [apigateway.HttpMethod.POST],
      integration: new apigatewayIntegrations.HttpLambdaIntegration('LambdaIntegration', uploadFunction),
    });

    // Create a DynamoDB table
    const fileMetadataTable = new Table(this, 'FileMetadataTable', {
      tableName: 'FileMetadata',
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'FileId', type: AttributeType.STRING },
      sortKey: { name: 'UploadDate', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY, // adjust this as needed
    });

    // Add a global secondary index to the table
    fileMetadataTable.addGlobalSecondaryIndex({
      indexName: 'UploadDateIndex',
      partitionKey: { name: 'SyntheticKey', type: AttributeType.STRING },
      sortKey: { name: 'UploadDate', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    // Create a Lambda function to handle S3 events
    const writeMetadataFunction = new lambda.Function(this, 'writeMetadataFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'writeMetadata.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: fileMetadataTable.tableName,
      },
    });

    // Grant the Lambda function permissions to write to the DynamoDB table
    fileMetadataTable.grantWriteData(writeMetadataFunction);

    // Set up the S3 event notification to trigger the Lambda function
    uploadBucket.addEventNotification(EventType.OBJECT_CREATED, new s3n.LambdaDestination(writeMetadataFunction));

    // Create a Lambda function to query the file metadata by date range
    const getMetadataFunction = new lambda.Function(this, 'getMetadataFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getMetadata.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: fileMetadataTable.tableName,
      },
    });

    // Grant the Lambda function permissions to read from the DynamoDB table
    fileMetadataTable.grantReadData(getMetadataFunction)

    // Add a GET route to query the file metadata by date range
    api.addRoutes({
      path: '/metadata',
      methods: [apigateway.HttpMethod.GET],
      integration: new apigatewayIntegrations.HttpLambdaIntegration('LambdaIntegration', getMetadataFunction),
    });

    // Output the endpoint URL to the stack outputs
    new CfnOutput(this, 'EndpointUrl', {
      value: `${api.apiEndpoint}/upload`,
    });
  }
}
