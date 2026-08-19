terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region     = var.aws_region
  access_key = "test"
  secret_key = "test"

  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true

  s3_use_path_style = true

  endpoints {
    s3 = "http://localhost:4566"
  }
}

# S3 Bucket
resource "aws_s3_bucket" "store" {
  bucket = var.bucket_name

  tags = {
    Name        = "Alankrutha Store"
    Environment = "dev"
    ManagedBy   = "Terraform"
    Project     = "alankrutha-store"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "store" {
  bucket = aws_s3_bucket.store.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "store" {
  bucket = aws_s3_bucket.store.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Find all supported image files
locals {
  image_files = toset(flatten([
    fileset("${path.module}/../public", "*.png"),
    fileset("${path.module}/../public", "*.jpg"),
    fileset("${path.module}/../public", "*.jpeg"),
    fileset("${path.module}/../public", "*.svg")
  ]))
}

# Upload images to S3
resource "aws_s3_object" "images" {
  for_each = local.image_files

  bucket = aws_s3_bucket.store.id
  key    = each.value
  source = "${path.module}/../public/${each.value}"

  content_type = lookup(
    {
      ".png"  = "image/png"
      ".jpg"  = "image/jpeg"
      ".jpeg" = "image/jpeg"
      ".svg"  = "image/svg+xml"
    },
    lower(regex("\\.[^.]+$", each.value)),
    "application/octet-stream"
  )
}