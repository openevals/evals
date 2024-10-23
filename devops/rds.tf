resource "aws_db_instance" "openevals_rds" {
  allocated_storage    = 30
  engine               = "postgres"
  engine_version       = "16.4"
  instance_class       = "db.t3.medium"
  multi_az             = false
  identifier             = "openevals"
  db_name              = "openevals"
  username             = "openevals"
  password             = var.db_password
  parameter_group_name = "default.postgres16"
  apply_immediately    = true

  db_subnet_group_name = aws_db_subnet_group.openevals_subnet_group.name
  vpc_security_group_ids = [aws_security_group.openevals_rds_sg.id]

  publicly_accessible = true
  skip_final_snapshot = true
  deletion_protection  = true
  copy_tags_to_snapshot = true
}

resource "aws_db_subnet_group" "openevals_subnet_group" {
  name       = "openevals-subnet-group"
  description = "Subnet group for OpenEvals RDS instance"
  subnet_ids  = concat(module.vpc.public_subnets, module.vpc.private_subnets)
  tags = {
    Name = "OpenEvals Subnet Group"
  }
}

resource "aws_security_group" "openevals_rds_sg" {
  name        = "openevals-sg"
  description = "OpenEval Security Group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Allow traffic from VPC"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outgoing traffic"
  }
}