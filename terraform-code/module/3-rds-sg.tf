data "aws_eks_cluster" "eks" {
  name = aws_eks_cluster.cluster.name
}

resource "aws_security_group" "rds_sg" {
  name   = "rds-sg"
  vpc_id = aws_vpc.EKS_VPC.id

  # Allow MySQL access ONLY from EKS worker nodes
  ingress {
    description     = "Allow MySQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    # security_groups = [aws_security_group.EKS_SG.id]
    security_groups = [
      data.aws_eks_cluster.eks.vpc_config[0].cluster_security_group_id
    ]
  }

  egress {  
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.common_tags
}