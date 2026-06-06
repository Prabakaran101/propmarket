# resource "aws_s3_bucket_policy" "cloudtrail_policy" {
#   bucket = aws_s3_bucket.cloudtrail_bucket.id
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Sid = "AWSCloudTrailAclCheck"
#         Effect = "Allow"
#         Principal = {
#           Service = "cloudtrail.amazonaws.com"
#         }
#         Action = "s3:GetBucketAcl"
#         Resource = aws_s3_bucket.cloudtrail_bucket.arn
#       },
#       {
#         Sid = "AWSCloudTrailWrite"
#         Effect = "Allow"
#         Principal = {
#           Service = "cloudtrail.amazonaws.com"
#         }
#         Action = "s3:PutObject"
#         Resource = "${aws_s3_bucket.cloudtrail_bucket.arn}/AWSLogs/*"
#         Condition = {
#           StringEquals = {
#             "s3:x-amz-acl" = "bucket-owner-full-control"
#           }
#         }
#       }
#     ]
#   })
# }