resource "aws_eks_node_group" "eks_nodes" {
  cluster_name    = aws_eks_cluster.cluster.name
  node_group_name = "${var.env}-${var.node_group_name}"
  node_role_arn   = aws_iam_role.eks_node_role.arn

  subnet_ids = [
    aws_subnet.public_subnet_1.id,
    aws_subnet.public_subnet_2.id
  ]

  instance_types = var.instance_types

  scaling_config {
    desired_size = var.desired_size
    min_size     = var.min_size
    max_size     = var.max_size
  }

  # ✔ SAFE Launch Template usage
  # launch_template {
  #   id      = aws_launch_template.eks_lt.id
  #   version = "$Latest"
  # }
  #  this consumes lot of time and need correction and optimisation

  # ✔ Kubernetes labels
  labels = merge(var.node_labels, {
    environment = var.env
  })

  # ✔ Tags
  tags = merge(var.common_tags, {
    Name        = "${var.env}-${var.node_group_name}"
    Environment = var.env
  })

  depends_on = [
    aws_iam_role_policy_attachment.worker_node_policy,
    aws_iam_role_policy_attachment.cni_policy,
    aws_iam_role_policy_attachment.ecr_policy,
    aws_iam_instance_profile.eks_node_profile
  ]
}

