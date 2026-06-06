# data "aws_eks_cluster" "cluster" {
#   name = aws_eks_cluster.cluster.name
# }
#
# data "aws_eks_cluster_auth" "cluster" {
#   name = aws_eks_cluster.cluster.name
# }
#
# data "aws_iam_openid_connect_provider" "eks" {
#   url = aws_eks_cluster.cluster.identity[0].oidc.issuer
# }

#  created after we get the arn to use it for iam policy for pod and secret
#  annotations:
#  eks.amazonaws.com/role-arn: <IAM_ROLE_ARN>