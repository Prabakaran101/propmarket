# data "aws_ami" "eks_optimized" {
#   most_recent = true
#   owners      = ["amazon"]
#
#   filter {
#     name   = "name"
#     values = ["amazon-eks-node-${var.eks_version}-*"]
#   }
# }

# Makes error while creating nde group creation and attaching to eks