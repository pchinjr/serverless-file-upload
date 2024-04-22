# serverless-file-upload
Bunch of different ways to upload a file with serveless tools and technologies. 

# SAM (Serverless Application Model)
SAM (Serverless Application Model) is a framework for building serverless applications on AWS, providing a simplified way to define and deploy serverless resources using AWS CloudFormation. The source code can be found in `/serverless-upload-sam`. The `template.yaml` file declares all the resources and the source code for the three Lambda functions are in `/src/`. This codespace has the SAM CLI preconfigured for install. Use IAM Identity Center to create a user for SSO login. Instructions can be found here: https://aws.amazon.com/blogs/security/how-to-create-and-manage-users-within-aws-sso/

# CDK (Cloud Development Kit)
CDK (Cloud Development Kit) is a framework that allows developers to define and deploy infrastructure resources using familiar programming languages, such as TypeScript, Python, and Java, instead of writing CloudFormation templates. A CDK project is comprised of stacks defined in the `/lib` folder. Stacks are compositions of constructs. Constructs are instantiaions of AWS resources declared as programming objects using the CDK API. The application entry point is in `/bin` directory. The source code of the Lambda functions are in `/lambda`. 

# Terraform
Terraform is an open-source infrastructure as code tool that allows you to define and provision infrastructure resources across multiple cloud providers. It uses a declarative language to describe the desired state of your infrastructure and automatically manages the creation, modification, and deletion of resources to achieve that state.

## Example Usage of APIs
POST to your endpoint with Base64 encoded binary.
```bash
curl -X POST https://wtryhgfttj.execute-api.us-east-1.amazonaws.com/prod/upload \
     -H "Content-Type: application/json" \
     -d '{
    "filename": "example2.txt",
    "file": "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==",
    "contentType": "text/plain"
}'
```
GET to your endpoint to retreive metadata
```bash
curl -X GET "https://wy338hkp59.execute-api.us-east-1.amazonaws.com/metadata?startDate=2024-04-01&endDate=2024-04-08"
```