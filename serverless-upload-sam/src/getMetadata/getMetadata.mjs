import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

// Initialize DynamoDB client
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

export const lambdaHandler = async (event) => {
    try {
        // Extract query parameters from the event
        const startDate = event.queryStringParameters?.startDate; // e.g., '2023-03-20'
        const endDate = event.queryStringParameters?.endDate; // e.g., '2023-03-25'

        // Validate date format or implement appropriate error handling
        if (!startDate || !endDate) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Start date and end date must be provided" }),
            };
        }

        const params = {
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "UploadDate BETWEEN :startDate AND :endDate",
            ExpressionAttributeValues: {
                ":startDate": { S: `${startDate}T00:00:00Z` },
                ":endDate": { S: `${endDate}T23:59:59Z` }
            }
        };

        const command = new QueryCommand(params);
        const response = await dynamoDBClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify(response.Items),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error querying metadata", error: err.message }),
        };
    }
};
