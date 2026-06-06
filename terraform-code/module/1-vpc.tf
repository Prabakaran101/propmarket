# 1.Creating VPC
resource "aws_vpc" "EKS_VPC" {
  cidr_block       = var.vpc_cidr
  instance_tenancy = "default"

  tags = merge(
    var.common_tags,
    {
      Name = var.vpc_name
    }
  )
}

# 2.Creating Subnets
  # Public Subnet 1
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.EKS_VPC.id
  cidr_block              = var.public_subnet_1_cidr
  availability_zone       = var.public_subnet_1_az
  map_public_ip_on_launch = true

  tags = merge(
    var.common_tags,
    {
      Name = "EKS_PUBLIC_SUB1"
      # REQUIRED for EKS
      "kubernetes.io/cluster/${var.eks_name}" = "shared"
      # REQUIRED for internal load balancer
      "kubernetes.io/role/elb" = "1"
    }
  )
}

  # Public Subnet 2
resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.EKS_VPC.id
  cidr_block              = var.public_subnet_2_cidr
  availability_zone       = var.public_subnet_2_az
  map_public_ip_on_launch = true

  tags = merge(
    var.common_tags,
    {
      Name = "EKS_PUBLIC_SUB2"
      "kubernetes.io/cluster/${var.eks_name}" = "shared"
      "kubernetes.io/role/elb" = "1"
    }
  )
}

# 3. Internet Gateway
resource "aws_internet_gateway" "EKS_IGW" {
  vpc_id = aws_vpc.EKS_VPC.id

  tags = merge(
    var.common_tags,
    {
      Name = var.igw_name
      "kubernetes.io/cluster/${var.eks_name}" = "shared"
      "kubernetes.io/role/internal-elb" = "1"
    }
  )
}

# 4. Route Table
resource "aws_route_table" "EKS_RT" {
  vpc_id = aws_vpc.EKS_VPC.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.EKS_IGW.id
  }

  tags = merge(
    var.common_tags,
    {
      Name = var.route_table_name
      "kubernetes.io/cluster/${var.eks_name}" = "shared"
      "kubernetes.io/role/internal-elb" = "1"
    }
  )
}

# 5. Association Subnets
  # Association Subnet 1
resource "aws_route_table_association" "pub_subnet_1_assoc" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.EKS_RT.id
}

  # Association Subnet 2
resource "aws_route_table_association" "pub_subnet_2_assoc" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.EKS_RT.id
}

# Private Subnet 1
resource "aws_subnet" "private_subnet_1" {
  vpc_id                  = aws_vpc.EKS_VPC.id
  cidr_block              = var.private_subnet_1_cidr
  availability_zone       = var.private_subnet_1_az
  map_public_ip_on_launch = false

  tags = merge(
    var.common_tags,
    {
      Name = "EKS_PRIVATE_SUB1"
    }
  )
}

# Private Subnet 2
resource "aws_subnet" "private_subnet_2" {
  vpc_id                  = aws_vpc.EKS_VPC.id
  cidr_block              = var.private_subnet_2_cidr
  availability_zone       = var.private_subnet_2_az
  map_public_ip_on_launch = false

  tags = merge(
    var.common_tags,
    {
      Name = "EKS_PRIVATE_SUB2"
    }
  )
}


# If the worker node needed to be created in private subnets with NAT-Gateway
# Use this code along with it

#6. Elastic IP for NAT
# resource "aws_eip" "nat_eip" {
#   domain = "vpc"
#
#   tags = merge(var.common_tags, {
#     Name = "nat-eip"
#   })
# }
#
# # NAT Gateway
# resource "aws_nat_gateway" "nat" {
#   allocation_id = aws_eip.nat_eip.id
#   subnet_id     = aws_subnet.public_subnet_1.id
#
#   tags = merge(var.common_tags, {
#     Name = "nat-gateway"
#   })
# }

# 7. Private Route Table-2
# resource "aws_route_table" "private_rt" {
#   vpc_id = aws_vpc.EKS_VPC.id
#
#   route {
#     cidr_block     = "0.0.0.0/0"
#     nat_gateway_id = aws_nat_gateway.nat.id
#   }
#
#   tags = merge(var.common_tags, {
#     Name = "private-rt"
#   })
# }

# 8. VPC Endpoints

# resource "aws_vpc_endpoint" "s3" {
#   vpc_id       = aws_vpc.EKS_VPC.id
#   service_name = "com.amazonaws.${var.region}.s3"
#   vpc_endpoint_type = "Gateway"
#
#   route_table_ids = [
#     aws_route_table.EKS_RT.id,
#     aws_route_table.private_rt.id
#   ]
#
#   tags = merge(var.common_tags, {
#     Name = "s3-endpoint"
#   })
# }