# resource "aws_s3_bucket" "cloudtrail_bucket" {
#   bucket = "${var.project_name}-cloudtrail-logs"
#   force_destroy  = true
#   # enable_logging = false
# }
#
# resource "aws_cloudtrail" "main" {
#   name           = "${var.project_name}-trail"
#   s3_bucket_name = aws_s3_bucket.cloudtrail_bucket.bucket
#
#   enable_logging = true
#
#   event_selector {
#     read_write_type = "All"
#     include_management_events = true
#   }
# }
#
# # resource "aws_cloudtrail" "main" {
# #   name                          = "${var.project_name}-trail"
# #   s3_bucket_name                = aws_s3_bucket.cloudtrail_bucket.bucket
# #
# #   include_global_service_events = true
# #   is_multi_region_trail         = true
# #
# #   enable_logging = true
# #
# #   event_selector {
# #     read_write_type           = "All"
# #     include_management_events = true
# #   }
# #
# #   depends_on = [aws_s3_bucket_policy.cloudtrail_policy]
# # }