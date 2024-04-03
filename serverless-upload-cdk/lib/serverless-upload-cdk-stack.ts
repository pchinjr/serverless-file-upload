import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as path from 'path';

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

    // Output the endpoint URL to the stack outputs
    new CfnOutput(this, 'EndpointUrl', {
      value: `${api.apiEndpoint}/upload`,
    });
  }
}
