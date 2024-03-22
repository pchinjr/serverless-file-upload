import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

export const lambdaHandler = async (event) => {
    try {
        const record = event.Records[0].s3;
        const key = decodeURIComponent(record.object.key.replace(/\+/g, " "));
        const size = record.object.size;
        const uploadDate = new Date().toISOString();  // Assuming the current date as upload date
        const dbParams = {
            TableName: process.env.TABLE_NAME,
            Item: {
                FileId: { S: key },
                UploadDate: { S: uploadDate },
                FileSize: { N: size.toString() }
            }
        };

        await dynamoDBClient.send(new PutItemCommand(dbParams));

        return { statusCode: 200, body: 'Metadata saved successfully.' };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: `Error: ${err.message}` };
    }
};
