# serverless-file-upload
Welcome to the serverless-file-upload project! This project explores various ways to upload files using serverless technologies. It provides examples using three different frameworks: SAM (Serverless Application Model), CDK (Cloud Development Kit), and Terraform. Each framework has its own directory with source code and configuration files. The project also includes examples of how to use the APIs to upload files and retrieve metadata. Whether you're new to serverless or looking to expand your knowledge, this project is a great resource. Enjoy exploring!

# Setting Up GitHub Codespaces and AWS SSO
This guide will walk you through setting up GitHub Codespaces for this project and configuring AWS Single Sign-On (SSO) for AWS CLI.

## GitHub Codespaces Setup
GitHub Codespaces provides a fully featured cloud-based development environment. To set it up for this project:

1. Navigate to the main page of this repository on GitHub.
2. Click the green **"Code"** button and then select **"Open with Codespaces"**.
3. Select **"+ New codespace"**.

Your Codespace will be ready in a few moments, providing a VS Code instance running in your browser.

## AWS SSO Setup
AWS SSO allows you to manage access to multiple AWS accounts and business applications. To set it up:

1. Set up AWS SSO in your AWS account following the instructions in the [AWS SSO User Guide](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html).
2. In the AWS SSO console, create a permission set with the necessary permissions for your application. Assign this permission set to a user and specify the AWS account that the user can access.
3. In your Codespace, open a terminal and run `aws configure sso`. This command starts the AWS CLI SSO configuration process.
4. When prompted, enter the URL of your AWS SSO user portal (you can find this URL in the AWS SSO console), the name of the AWS region where your AWS SSO directory is hosted, and the name of the profile that you want to create (for example, `dev`).
5. This command opens a web browser where you can sign in to your AWS SSO account. After you sign in, the command stores your AWS SSO credentials in a profile in your AWS configuration file.

Now your AWS SSO credentials are set up in your Codespace, and your application can access AWS services. To use these credentials, specify the profile name when you run AWS CLI commands. For example, `aws s3 ls --profile dev`.

# SAM (Serverless Application Model)
SAM (Serverless Application Model) is a framework for building serverless applications on AWS, providing a simplified way to define and deploy serverless resources using AWS CloudFormation. The source code can be found in `/serverless-upload-sam`. The `template.yaml` file declares all the resources and the source code for the three Lambda functions are in `/src/`. This codespace has the SAM CLI preconfigured for install. Use IAM Identity Center to create a user for SSO login. Instructions can be found here: https://aws.amazon.com/blogs/security/how-to-create-and-manage-users-within-aws-sso/

# CDK (Cloud Development Kit)
CDK (Cloud Development Kit) is a framework that allows developers to define and deploy infrastructure resources using familiar programming languages, such as TypeScript, Python, and Java, instead of writing CloudFormation templates. A CDK project is comprised of stacks defined in the `/lib` folder. Stacks are compositions of constructs. Constructs are instantiaions of AWS resources declared as programming objects using the CDK API. The application entry point is in `/bin` directory. The source code of the Lambda functions are in `/lambda`. 

# Terraform
Terraform is an open-source infrastructure as code tool that allows you to define and provision infrastructure resources across multiple cloud providers. It uses a declarative language to describe the desired state of your infrastructure and automatically manages the creation, modification, and deletion of resources to achieve that state. `main.tf` is the complete resource manifest.

# Architect
Architect is an open-source framework for serverless applications. It uses a terse manifest called `.arc` file to declare your resources. It deploys CloudFormation stacks so you can eject from Architect to native CloudFormation at any time. 

# General Architecture
This project implements a serverless file upload system using three different frameworks: SAM (Serverless Application Model), CDK (Cloud Development Kit), and Terraform. Despite the differences in the tools used, the general architecture remains the same across all implementations.

The architecture consists of the following components:

1. API Gateway: This is the entry point for the application. It exposes two endpoints: one for uploading files (/upload) and one for retrieving metadata (/metadata).

2. Lambda Functions: There are three Lambda functions in the system:

    - `UploadFunction`: Triggered when a POST request is made to the /upload endpoint. It receives the file data and metadata from the request, stores the file data in an S3 bucket, and stores the metadata in a DynamoDB table.

    - `GetMetadataFunction`: Triggered when a GET request is made to the /metadata endpoint. It retrieves metadata from the DynamoDB table and returns it to the user.

    - `WriteMetadataFunction`: Triggered by an S3 event when a new object is created in the S3 bucket. It writes metadata about the new object to the DynamoDB table.

3. S3 Bucket: This is where the uploaded files are stored. When a new object is created in this bucket, it triggers the `WriteMetadataFunction`. 

4. DynamoDB Table: This is where metadata about the uploaded files is stored. The `UploadFunction` and `WriteMetadataFunction` write metadata to this table, and the `GetMetadataFunction` reads metadata from this table.

5. IAM Roles: These are used to grant the necessary permissions to the Lambda functions. For example, the `UploadFunction` needs permission to write to the S3 bucket, and the `GetMetadataFunction` needs permission to read from the DynamoDB table.

6. SNS Topic: The Architect framework has a native event bus that uses SNS Topics to automatically register the target Lambda. We use this to asyncronously process the file metadata instead of an S3 trigger. Same functionality with a different implementation.

This architecture allows for scalable, efficient processing of file uploads and metadata retrieval. The use of serverless technologies means that you only pay for the compute time you consume, and you don't have to manage any servers.

## Example Usage of APIs
POST to your endpoint with Base64 encoded binary.
```bash
curl -X POST https://orange-umbrella-jx6p6qrrgrc9qv-3333.app.github.dev/upload \
     -H "Content-Type: application/json" \
     -d '{
    "filename": "example.txt",
    "file": "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==",
    "contentType": "text/plain"
}'
```
```bash
curl -X POST https://p0ery5zhc9.execute-api.us-east-1.amazonaws.com/upload \
     -H "Content-Type: application/json" \
     -d '{
    "filename": "example2.txt",
    "file": "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==",
    "contentType": "text/plain"
}'
```

GET to your endpoint to retreive metadata
```bash
curl -X GET "https://orange-umbrella-jx6p6qrrgrc9qv-3333.app.github.dev/metadata?startDate=2024-04-01&endDate=2024-05-31"
```
```bash
curl -X GET "https://p0ery5zhc9.execute-api.us-east-1.amazonaws.com/metadata?startDate=2024-04-01&endDate=2024-05-31"
```

## Encoding text to Base64
Create a file called `text.txt` and write some text in it. Convert this text file to Base64 with the following command:
`$ base64 text.txt > text.txt.base64`
For example, a text file containing "Praise Cage! Hallowed by thy name." becomes "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==" which can become the body of the POST request.

## Zip Lambdas for Terraform
Terraform does not have a native way to package your source code. You can manually zip a file and point Terraform to it. The command to zip a file is `$ zip upload.zip upload.mjs`.