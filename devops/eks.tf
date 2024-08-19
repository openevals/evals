module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.23.0"

  cluster_name    = local.cluster_name
  cluster_version = local.eks_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true

  cluster_enabled_log_types = []

  cluster_encryption_config = []

  cluster_addons = {
    kube-proxy = {
      addon_version = "v1.30.0-eksbuild.3"
    }
    vpc-cni = {
      addon_version = "v1.18.3-eksbuild.1"
    }
    coredns = {
      addon_version = "v1.11.1-eksbuild.9"
    }
  }

  enable_cluster_creator_admin_permissions = true

  eks_managed_node_groups = {
    general_processing = {
      name           = "general-processing"
      instance_types = var.general_processing.instance_types
      min_size       = var.general_processing.min_size
      max_size       = var.general_processing.max_size
      desired_size   = var.general_processing.desired_size
      ami_type       = "AL2_x86_64"
      capacity_type  = "ON_DEMAND"

      disk_size = 20

      additional_security_group_ids = [aws_security_group.openevals_eks_sg.id]

      tags = {
        "kubernetes.io/cluster/${local.cluster_name}" : "owned"
        "group-type" : "general-processing"
      }
      labels = {
        "group-type" : "general-processing"
      }
    }
  }
}

module "eks-aws-auth" {
  source  = "terraform-aws-modules/eks/aws//modules/aws-auth"
  version = "20.23.0"

  #Define aws-auth ConfigMap
  manage_aws_auth_configmap = true
  aws_auth_users = [
    for arn in var.users_arns : {
      userarn  = arn
      username = split("/", arn)[1]
      groups   = ["system:masters"]
    }
  ]
}

resource "aws_security_group" "openevals_eks_sg" {
  name        = "openevals-eks-sg"
  description = "OpenEvals Cluster Security Group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
    description = "Allow all internal cluster traffic"
  }

  ingress {
    from_port   = 80
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allos HTTP/HTTPS from everywhere"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outgoing traffic"
  }

  tags = {
    Name = "OpenEvals Cluster Security Group"
  }
}
