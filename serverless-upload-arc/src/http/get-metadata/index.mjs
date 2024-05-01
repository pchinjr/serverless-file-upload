import arc from '@architect/functions'
export const handler = arc.http(ddbHandler)
let client = await arc.tables()
let FileMetadataTable = client.FileMetadataTable

async function ddbHandler(req) {
    try {

        // Extract query parameters from the event
        const startDate = req.queryStringParameters?.startDate; // e.g., '2023-03-20'
        const endDate = req.queryStringParameters?.endDate; // e.g., '2023-03-25'

        // Validate date format or implement appropriate error handling
        if (!startDate || !endDate) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Start date and end date must be provided" }),
            };
        }

        let queryResults = await FileMetadataTable.query({
            IndexName: 'byUploadDate',
            KeyConditionExpression: 'SyntheticKey = :synKeyVal AND UploadDate BETWEEN :startDate AND :endDate',
            ExpressionAttributeValues: {
                ":synKeyVal": "FileUpload",
                ":startDate": startDate,
                ":endDate": endDate
            },
        })

        return {
            statusCode: 200,
            body: JSON.stringify(queryResults)
        }
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error querying metadata", error: err.message }),
        };
    }
};