# # IAM Role for Pod (IRSA ROLE)
# resource "aws_iam_role" "eks_pod_role" {
#   name = "eks-pod-secrets-role"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Effect = "Allow"
#       Principal = {
#         # Federated = var.oidc_provider_arn
#         # Federated = data.aws_eks_cluster.cluster.identity[0].oidc.issuer
#         Federated = data.aws_iam_openid_connect_provider.eks.arn
#       }
#       Action = "sts:AssumeRoleWithWebIdentity"
#     }]
#   })
# }
# # IAM Policy (Secrets access)
# resource "aws_iam_role_policy" "secrets_access" {
#   name = "secrets-access"
#   role = aws_iam_role.eks_pod_role.id
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Effect = "Allow"
#       Action = [
#         "secretsmanager:GetSecretValue",
#         "secretsmanager:DescribeSecret"
#       ]
#       Resource = aws_secretsmanager_secret.app_secret.arn
#     }]
#   })
# }