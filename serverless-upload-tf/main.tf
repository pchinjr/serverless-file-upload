output "account_id" {
  value = local.account_id
}

resource "aws_s3_bucket" "file_upload" {
  bucket = "file-upload-${var.region}-${local.account_id}"
}

resource "aws_iam_role" "lambda_s3_role" {
  name = "lambda_s3_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    },
    ]
  })
}

resource "aws_iam_role_policy" "s3_policy" {
   name   = "s3_access_policy"
   role = aws_iam_role.lambda_s3_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject"
        ],
        Resource = "${aws_s3_bucket.file_upload.arn}/*"
      },
      {
      Effect = "Allow",
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      Resource = "arn:aws:logs:*:*:*",
    }
    ]
  })
}

resource "aws_lambda_function" "upload_lambda" {
  function_name = "UploadFunction"
  handler       = "upload.lambdaHandler"  
  runtime       = "nodejs20.x"     
  filename      = "${path.module}/src/upload/upload.zip"
  source_code_hash = filebase64sha256("${path.module}/src/upload/upload.zip")
  role = aws_iam_role.lambda_s3_role.arn
  environment {
    variables = {
      BUCKET_NAME: aws_s3_bucket.file_upload.bucket
    }
  }
}

resource "aws_api_gateway_rest_api" "api" {
  name        = "UploadAPI"
  description = "API for file uploads"
}

resource "aws_api_gateway_resource" "api_resource" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "upload"
}

resource "aws_api_gateway_method" "post_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_resource.id
  http_method = aws_api_gateway_method.post_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.upload_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_integration.lambda_metadata_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = "prod"

  # Force new deployment if APIs change
  triggers = {
    redeployment = sha1(join(",", [jsonencode(aws_api_gateway_integration.lambda_integration), jsonencode(aws_api_gateway_integration.lambda_metadata_integration)]))
  }
}

resource "aws_lambda_permission" "api_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_dynamodb_table" "file_metadata" {
  name           = "FileMetadata"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "FileId"
  range_key      = "UploadDate"

  attribute {
    name = "FileId"
    type = "S"
  }

  attribute {
    name = "UploadDate"
    type = "S"
  }

  attribute {
    name = "SyntheticKey"
    type = "S"
  }

  global_secondary_index {
    name               = "UploadDateIndex"
    hash_key           = "SyntheticKey"
    range_key          = "UploadDate"
    projection_type    = "ALL"
  }
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.file_upload.bucket

  lambda_function {
    lambda_function_arn = aws_lambda_function.write_metadata.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.allow_s3_invocation]
}

resource "aws_lambda_permission" "allow_s3_invocation" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.write_metadata.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.file_upload.arn
}

resource "aws_iam_role" "lambda_dynamodb_role" {
  name = "lambda_dynamodb_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "dynamodb_policy" {
   name   = "dynamodb_access_policy"
   role = aws_iam_role.lambda_dynamodb_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        Resource = "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.file_metadata.name}/*"
      },
      {
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ],
        Resource = "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.file_metadata.name}"
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_lambda_function" "write_metadata" {
  function_name = "WriteMetadata"
  handler       = "writeMetadata.lambdaHandler"  
  runtime       = "nodejs20.x"     
  filename      = "${path.module}/src/writeMetadata/writeMetadata.zip"
  source_code_hash = filebase64sha256("${path.module}/src/writeMetadata/writeMetadata.zip")
  role = aws_iam_role.lambda_dynamodb_role.arn
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.file_metadata.name
    }
  }
}

resource "aws_api_gateway_resource" "api_metadata_resource" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "metadata"
}

resource "aws_api_gateway_method" "get_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_metadata_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_metadata_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_metadata_resource.id
  http_method = aws_api_gateway_method.get_method.http_method

  integration_http_method = "POST"  // Lambda uses POST for invocations
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_metadata.invoke_arn
}

resource "aws_lambda_permission" "api_metadata_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvokeQuery"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_metadata.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*/metadata"
}

resource "aws_lambda_function" "get_metadata" {
  function_name = "GetMetadata"
  handler       = "getMetadata.lambdaHandler"  
  runtime       = "nodejs20.x"     
  filename      = "${path.module}/src/getMetadata/getMetadata.zip"
  source_code_hash = filebase64sha256("${path.module}/src/getMetadata/getMetadata.zip")
  role = aws_iam_role.lambda_dynamodb_role.arn
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.file_metadata.name
    }
  }
}

output "api_endpoint" {
  value = "${aws_api_gateway_deployment.api_deployment.invoke_url}/upload"
}