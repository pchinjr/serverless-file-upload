# serverless-file-upload
All the different ways to upload a file


curl -X POST https://stu0ddbdb5.execute-api.us-east-1.amazonaws.com/prod/upload \
     -H "Content-Type: application/json" \
     -d '{
    "filename": "example.txt",
    "file": "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==",
    "contentType": "text/plain"
}'

curl -X GET "https://your-api-gateway-url/metadata?startDate=2023-03-01&endDate=2023-03-31"
