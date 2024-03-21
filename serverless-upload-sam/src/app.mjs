import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
const s3 = new S3Client({region: 'us-east-1'});

export const lambdaHandler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const decodedFile = Buffer.from(body.file, 'base64');
        const input = {
            "Body": decodedFile,
            "Bucket": process.env.BUCKET_NAME,
            "Key": body.filename
          };
        const command = new PutObjectCommand(input);
        const response = await s3.send(command);
        const message = "Praise Cage! " + JSON.stringify(response)
        return {
            statusCode: 200,
            body: JSON.stringify({ message }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error uploading file", error: err.message }),
        };
    }
};
