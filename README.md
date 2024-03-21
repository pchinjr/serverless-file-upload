# serverless-file-upload
All the different ways to upload a file


curl -X POST https://iuz9a4utn6.execute-api.us-east-1.amazonaws.com/prod/upload \
     -H "Content-Type: application/json" \
     -d '{
    "filename": "example.txt",
    "file": "UHJhaXNlIENhZ2UhIEhhbGxvd2VkIGJ5IHRoeSBuYW1lLg==",
    "contentType": "text/plain"
}'
