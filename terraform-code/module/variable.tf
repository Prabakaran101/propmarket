# ---------- GLOBAL ----------
variable "project_name" {}
variable "env" {}
variable "region" {}
variable "common_tags" {}

# ---------- VPC ----------
variable "vpc_cidr" {}
variable "vpc_name" {}

# ---------- SUBNETS ----------
variable "public_subnet_1_cidr" {}
variable "public_subnet_2_cidr" {}
variable "public_subnet_1_az" {}
variable "public_subnet_2_az" {}

variable "private_subnet_1_cidr" {}
variable "private_subnet_2_cidr" {}
variable "private_subnet_1_az" {}
variable "private_subnet_2_az" {}

# ---------- IGW ----------
variable "igw_name" {}

# ---------- ROUTE TABLE ----------
variable "route_table_name" {}

# ---------- SECURITY GROUP ----------
variable "sg_name" {}
variable "sg_description" {}

# ---------- AMI ----------
variable "ami_name" {}

# ---------- LAUNCH TEMPLATE ----------
variable "instance_type" {}

# ---------- EKS ----------
variable "eks_name" {}
variable "eks_version" {}
variable "endpoint_public_access" {}
variable "endpoint_private_access" {}
variable "cluster_log_types" {}

# ---------- NODE GROUP ----------
variable "node_group_name" {}
variable "instance_types" {}
variable "desired_size" {}
variable "min_size" {}
variable "max_size" {}
variable "node_labels" {}

# ---------- RDS ----------
variable "db_name" {}
variable "db_username" {}
variable "db_password" {}

# ---------- SECRETS ----------
variable "secret_name" {}

# ---------- CLOUDWATCH ----------
variable "log_retention_days" {}

# ---------- S3 ----------
variable "bucket_name" {}
variable "block_public_access" {}