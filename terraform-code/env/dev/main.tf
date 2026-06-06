module "Cluster" {
  source = "../../module"

  ami_name                = var.ami_name
  block_public_access     = var.block_public_access
  bucket_name             = var.bucket_name
  cluster_log_types       = var.cluster_log_types
  common_tags             = var.common_tags

  db_name                 = var.db_name
  db_password             = var.db_password
  db_username             = var.db_username

  desired_size            = var.desired_size

  eks_name                = var.eks_name
  eks_version             = var.eks_version
  endpoint_private_access = var.endpoint_private_access
  endpoint_public_access  = var.endpoint_public_access

  env                     = var.env
  igw_name                = var.igw_name

  instance_type           = var.instance_type
  instance_types          = var.instance_types

  log_retention_days      = var.log_retention_days

  max_size                = var.max_size
  min_size                = var.min_size

  node_group_name         = var.node_group_name
  node_labels             = var.node_labels

  private_subnet_1_az     = var.private_subnet_1_az
  private_subnet_1_cidr   = var.private_subnet_1_cidr
  private_subnet_2_az     = var.private_subnet_2_az
  private_subnet_2_cidr   = var.private_subnet_2_cidr

  project_name            = var.project_name

  public_subnet_1_az      = var.public_subnet_1_az
  public_subnet_1_cidr    = var.public_subnet_1_cidr
  public_subnet_2_az      = var.public_subnet_2_az
  public_subnet_2_cidr    = var.public_subnet_2_cidr

  region                  = var.region
  route_table_name        = var.route_table_name

  secret_name             = var.secret_name

  sg_description          = var.sg_description
  sg_name                 = var.sg_name

  vpc_cidr                = var.vpc_cidr
  vpc_name                = var.vpc_name
}