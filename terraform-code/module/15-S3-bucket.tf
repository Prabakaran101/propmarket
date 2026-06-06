# # 1. S3 BUCKET (FIRST)
# resource "aws_s3_bucket" "project_bucket" {
#   # bucket = var.bucket_name
#   bucket = "${var.bucket_name}-${var.env}"
#   force_destroy  = true
# }
#
# # 2. VERSIONING
# resource "aws_s3_bucket_versioning" "versioning" {
#   bucket = aws_s3_bucket.project_bucket.id
#
#   versioning_configuration {
#     status = "Disabled"
#   }
# }
#
# # 3. ENCRYPTION
# resource "aws_s3_bucket_server_side_encryption_configuration" "project_encrypt" {
#   bucket = aws_s3_bucket.project_bucket.id
#
#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm = "AES256"
#     }
#   }
# }
#
# # 4. PUBLIC ACCESS BLOCK (CONTROLLED BY VARIABLE)
# resource "aws_s3_bucket_public_access_block" "block" {
#   bucket = aws_s3_bucket.project_bucket.id
#
#   block_public_acls       = var.block_public_access
#   block_public_policy     = var.block_public_access
#   ignore_public_acls      = var.block_public_access
#   restrict_public_buckets = var.block_public_access
# }