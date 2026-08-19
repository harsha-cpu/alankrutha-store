output "bucket_name" {
  description = "Name of the Alankrutha Store S3 bucket"
  value       = aws_s3_bucket.store.bucket
}

output "bucket_arn" {
  description = "ARN of the Alankrutha Store S3 bucket"
  value       = aws_s3_bucket.store.arn
}