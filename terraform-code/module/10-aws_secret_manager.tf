# resource "aws_secretsmanager_secret" "app_secret" {
#   name = var.secret_name
#   tags = var.common_tags
# }
#
# resource "aws_secretsmanager_secret_version" "app_secret_value" {
#   secret_id = aws_secretsmanager_secret.app_secret.id
#
#   secret_string = jsonencode({
#     username = var.db_username
#     password = var.db_password
#
#   })
# }
#
# # 1. AWS Secrets Manager (stores username/password)
# # ↓
# # 2. IAM Role (IRSA - grants access to secret)
# # ↓
# # 3. OIDC Provider (trust bridge between EKS and AWS IAM)
# # ↓
# # 4. Kubernetes ServiceAccount (mapped to IAM role)
# # ↓
# # 5. Pod (your application)
# # ↓
# # 6. AWS SDK call (GetSecretValue)
# # ↓
# # 7. Returns DB credentials
# # ↓
# # 8. App connects to RDS