# ---------- GLOBAL ----------
project_name = "mypoc"
env          = "dev"
region       = "us-west-2"

common_tags = {
  Project     = "myproject"
  Environment = "dev"
  Owner       = "team-devops"
}

# ---------- VPC ----------
vpc_cidr = "10.0.0.0/16"
vpc_name = "eks-vpc"

# ---------- SUBNETS ----------
public_subnet_1_cidr = "10.0.1.0/24"
public_subnet_2_cidr = "10.0.2.0/24"
public_subnet_1_az   = "us-west-2a"
public_subnet_2_az   = "us-west-2b"

private_subnet_1_cidr = "10.0.3.0/24"
private_subnet_2_cidr = "10.0.4.0/24"
private_subnet_1_az   = "us-west-2a"
private_subnet_2_az   = "us-west-2b"

# ---------- IGW ----------
igw_name = "eks-igw"

# ---------- ROUTE TABLE ----------
route_table_name = "eks-rt"

# ---------- SECURITY GROUP ----------
sg_name        = "eks-sg"
sg_description = "Security group for EKS cluster"

# ---------- AMI ----------
ami_name = "amzn2-ami-hvm-*-x86_64-gp2"

# ---------- LAUNCH TEMPLATE ----------
instance_type = "t3.medium"

# ---------- EKS ----------
eks_name                = "dev-cluster"
eks_version             = "1.34"
endpoint_public_access  = true
endpoint_private_access = false

cluster_log_types = ["api","audit","authenticator"]

# ---------- NODE GROUP ----------
node_group_name = "workers"

instance_types = ["t3.medium"]

desired_size = 2
min_size     = 2
max_size     = 3

node_labels = {
  role = "worker"
}

# ---------- RDS ----------
db_name     = "realestate"
db_username = "propadmin"
db_password = "admin123"

# ---------- SECRETS ----------
secret_name = "shared/app/db-secret"

# ---------- CLOUDWATCH ----------
log_retention_days = 7

# ---------- S3 ----------
bucket_name         = "praba101-bucket"
block_public_access = true