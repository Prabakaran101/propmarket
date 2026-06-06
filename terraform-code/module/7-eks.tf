resource "aws_eks_cluster" "cluster" {
  name     = var.eks_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.eks_version

  vpc_config {
    subnet_ids = [
      aws_subnet.public_subnet_1.id,
      aws_subnet.public_subnet_2.id,
      aws_subnet.private_subnet_1.id,
      aws_subnet.private_subnet_2.id
    ]

    endpoint_public_access  = var.endpoint_public_access
    endpoint_private_access = var.endpoint_private_access
  }

  enabled_cluster_log_types = var.cluster_log_types
  tags = merge(var.common_tags, {
    Name        = var.eks_name
    Environment = var.env
  })

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}