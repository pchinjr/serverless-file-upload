// This is the Lambda function that will be triggered by the API Gateway POST request
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({region: 'us-east-1'});

export const lambdaHandler = async (event) => {
    try {
        console.log(event)
        const body = JSON.parse(event.body);
        const decodedFile = Buffer.from(body.file, 'base64');
        const input = {
            "Body": decodedFile,
            "Bucket": process.env.BUCKET_NAME,
            "Key": body.filename,
            "ContentType": body.contentType
          };
        const command = new PutObjectCommand(input);
        const uploadResult = await s3.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Praise Cage!", uploadResult }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error uploading file", error: err.message }),
        };
    }
};