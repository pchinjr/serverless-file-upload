resource "aws_s3_bucket" "file_upload" {
  bucket = "file-upload-${var.region}-${var.account_id}"
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"

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

resource "aws_iam_role_policy" "lambda_policy" {
  name = "lambda_exec_policy"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject"
        ],
        Resource = "${aws_s3_bucket.file_upload.arn}/*"
      }
    ]
  })
}

resource "aws_lambda_function" "upload_lambda" {
  function_name = "UploadFunction"
  handler       = "index.lambdaHandler"  
  runtime       = "nodejs20.x"     

  s3_bucket = "my-lambda-code-bucket"
  s3_key    = "lambda-code.zip"

  role = aws_iam_role.lambda_exec_role.arn
}