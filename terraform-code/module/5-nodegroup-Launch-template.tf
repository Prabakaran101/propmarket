#
# resource "aws_launch_template" "eks_lt" {
#   name_prefix   = "eks-worker-lt"
#
#   # instance_type = var.instance_type # not  to use when mentioned node-group
#   # key_name = var.key_name #not required
#   # image_id = data.aws_ami.eks_optimized.id # makes error if fetched from data-block-AMI
#   network_interfaces {
#     associate_public_ip_address = true
#     security_groups             = [aws_security_group.EKS_SG.id]
#   }
#
#   metadata_options {
#     http_endpoint = "enabled"
#     http_tokens = "required"
#   }
#
# # special characters may break JSON/API request
# # multiline script may get corrupted
#
#   tag_specifications {
#     resource_type = "instance"
#
#     tags = {
#       Name = "eks-worker-node"
#     }
#   }
# }

# #This one fails with EKS-node creation so correct later