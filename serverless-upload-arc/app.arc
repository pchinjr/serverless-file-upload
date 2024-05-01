@aws
region us-east-1
profile arc-admin

@app
serverless-upload-arc

@http
get /
post /upload
get /metadata

@events
write-metadata

@tables
FileMetadataTable
  FileId *String
  UploadDate **String

@tables-indexes
FileMetadataTable
  SyntheticKey *String
  UploadDate **String
  name byUploadDate

@plugins
architect/plugin-storage-public
ticketplushq/arc-plugin-s3rver

@storage-public
FileUploadBucket

