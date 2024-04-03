# serverless-file-upload
All the different ways to upload a file with serveless tools and technologies. 

# SAM (Serverless Application Model)
SAM (Serverless Application Model) is a framework for building serverless applications on AWS, providing a simplified way to define and deploy serverless resources using AWS CloudFormation. The source code can be found in `/serverless-upload-sam`. The `template.yaml` file declares all the resources and the source code for the three Lambda functions are in `/src/`. This codespace has the SAM CLI preconfigured for install. Use IAM Identity Center to create a user for SSO login. Instructions can be found here: https://aws.amazon.com/blogs/security/how-to-create-and-manage-users-within-aws-sso/

# CDK (Cloud Development Kit)
CDK (Cloud Development Kit) is a framework that allows beginners to define and deploy infrastructure resources using familiar programming languages, such as TypeScript, Python, and Java, instead of writing CloudFormation templates.

## Example Usage of APIs
POST to your endpoint with Base64 encoded binary.
```bash
curl -X POST https://wy338hkp59.execute-api.us-east-1.amazonaws.com/upload \
     -H "Content-Type: application/json" \
     -d '{
    "filename": "example2.txt",
    "file": "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==",
    "contentType": "text/plain"
}'
```
GET to your endpoint to retreive metadata
```bash
curl -X GET "https://wy338hkp59.execute-api.us-east-1.amazonaws.com/metadata?startDate=2024-04-01&endDate=2024-04-03"
```