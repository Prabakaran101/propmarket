# output "oidc_issuer" {
#   value = data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer
# }

# ---------- EKS ----------
output "eks_cluster_name" {
  value = aws_eks_cluster.cluster.name
}
output "eks_cluster_endpoint" {
  value = aws_eks_cluster.cluster.endpoint
}
output "eks_cluster_ca" {
  value = aws_eks_cluster.cluster.certificate_authority[0].data
}
# ---------- NODE GROUP ----------
output "node_group_name" {
  value = aws_eks_node_group.eks_nodes.node_group_name
}
# ---------- RDS ----------
# output "rds_endpoint" {
#   value = aws_db_instance.mysql.endpoint
# }
# output "rds_db_name" {
#   value = aws_db_instance.mysql.db_name
# }
# # ---------- S3 ----------
# output "s3_bucket_name" {
#   value = aws_s3_bucket.project_bucket.bucket
# }
# ---------- VPC ----------
output "vpc_id" {
  value = aws_vpc.EKS_VPC.id
}
# ---------- SUBNETS ----------
output "public_subnets" {
  value = [
    aws_subnet.public_subnet_1.id,
    aws_subnet.public_subnet_2.id
  ]
}
output "private_subnets" {
  value = [
    aws_subnet.private_subnet_1.id,
    aws_subnet.private_subnet_2.id
  ]
}