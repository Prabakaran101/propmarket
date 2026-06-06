# DB Subnet Group

resource "aws_db_subnet_group" "rds_subnet_group" {
  name = "rds-subnet-group"

  subnet_ids = [
    aws_subnet.private_subnet_1.id,
    aws_subnet.private_subnet_2.id
  ]

  tags = var.common_tags
}

#  RDS Instance
resource "aws_db_instance" "mysql" {
  identifier         = "realestate"
  engine             = "postgres"
  instance_class     = "db.t3.micro"
  storage_type       = "gp2"
  allocated_storage  = 20
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  port = 5432

  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  publicly_accessible = false
  backup_retention_period = 7
  skip_final_snapshot = true

  multi_az = false

  tags = var.common_tags
}
#
# resource "aws_db_instance" "mysql_read_replica" {
#   identifier = "my-rds-db-replica"
#
#   # This connects replica to primary DB
#   replicate_source_db = aws_db_instance.mysql.identifier
#
#   instance_class = "db.t3.micro"
#
#   publicly_accessible = false
#
#   # Optional tuning
#   auto_minor_version_upgrade = true
#   backup_retention_period   = 0
#
#   tags = var.common_tags
# }