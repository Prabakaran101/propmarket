# resource "aws_iam_role" "ebs_csi_role" {
#   name = "EBS_CSI_Role"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Effect = "Allow"
#       Principal = {
#         # Federated = "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/<OIDC_PROVIDER>"
#         Federated = var.oidc_provider_arn
#       }
#       Action = "sts:AssumeRoleWithWebIdentity"
#     }]
#   })
# }
# # Attach EBS CSI Policy
# resource "aws_iam_role_policy_attachment" "ebs_csi_policy" {
#   role       = aws_iam_role.ebs_csi_role.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
# }
