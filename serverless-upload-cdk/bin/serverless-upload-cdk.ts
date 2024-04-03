#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessUploadCdkStack } from '../lib/serverless-upload-cdk-stack';

const app = new cdk.App();
new ServerlessUploadCdkStack(app, 'ServerlessUploadCdkStack', {
});