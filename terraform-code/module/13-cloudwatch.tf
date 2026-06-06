# # resource "aws_cloudwatch_log_group" "eks_logs" {
# #   name              = "/aws/eks/${var.eks_name}/cluster"
# #   retention_in_days = var.log_retention_days
# # }
#
# # Having this extra cloudwatch gives error since it is already enabled in EKS for logs
# # # enabled_cluster_log_types = var.cluster_log_types
# resource "aws_cloudwatch_dashboard" "cloudwatch" {
#   dashboard_name = "my-dashboard"
#
#   dashboard_body = jsonencode({
#     widgets = [
#       {
#         type = "metric"
#         x    = 0
#         y    = 0
#         width = 12
#         height = 6
#
#         properties = {
#           metrics = [
#             ["AWS/EC2", "CPUUtilization", "InstanceId", "*"],
#             ["AWS/EC2", "NetworkIn", "InstanceId", "*"],
#             ["AWS/EC2", "NetworkOut", "InstanceId", "*"],
#             ["AWS/EC2", "StatusCheckFailed", "InstanceId", "*"]
#           ]
#           period = 300
#           stat   = "Average"
#           region = "us-west-2"
#           title  = "EC2 CPU Utilization"
#         }
#       }
#     ]
#   })
# }