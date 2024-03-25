# serverless-file-upload
All the different ways to upload a file


curl -X POST https://gvl64a3spl.execute-api.us-east-1.amazonaws.com/prod/upload \
     -H "Content-Type: application/json" \
     -d '{
    "filename": "example3.txt",
    "file": "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==",
    "contentType": "text/plain"
}'

curl -X GET "https://gvl64a3spl.execute-api.us-east-1.amazonaws.com/prod/metadata?startDate=2024-03-22&endDate=2024-03-25"
