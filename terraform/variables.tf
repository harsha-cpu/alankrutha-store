variable "aws_region" {
  description = "AWS region used by the local Floci environment"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "S3 bucket name for Alankrutha Store"
  type        = string
  default     = "alankrutha-store"
}