# # this doesnt connect with eks sg and made error during connection with rds, so backend pod dint connect rds
#
# resource "aws_security_group" "EKS_SG" {
#   name        = var.sg_name
#   description = var.sg_description
#   vpc_id      = aws_vpc.EKS_VPC.id
#
#   # HTTP node-to-node communication
#   ingress {
#     from_port   = 80
#     to_port     = 80
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#   # Allow HTTPS; ssl needed (important for ALB / ingress)
#   ingress {
#     description = "Allow HTTPS"
#     from_port   = 443
#     to_port     = 443
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#   # Allow node-to-node communication (VERY IMPORTANT)
#   ingress {
#     description = "Node to Node communication"
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     self        = true
#   }
#   # Outbound (allow all )
#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#
#   tags = {
#     Name = var.sg_name
#   }
# }
#
# # ICMP (ping)
# # ingress {
# #   from_port   = -1
# #   to_port     = -1
# #   protocol    = "icmp"
# #   cidr_blocks = ["0.0.0.0/0"]
# # }
#
# # SSH access
# # ingress {
# #   from_port   = 22
# #   to_port     = 22
# #   protocol    = "tcp"
# #   cidr_blocks = ["0.0.0.0/0"] # or only my ip mentioned
# # }