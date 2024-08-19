
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.13.0"

  name = local.cluster_name

  cidr = var.cidr_subnet
  azs  = var.zones

  private_subnets = [cidrsubnet(var.cidr_subnet, 3, 5), cidrsubnet(var.cidr_subnet, 3, 3), cidrsubnet(var.cidr_subnet, 3, 4)]
  public_subnets  = [cidrsubnet(var.cidr_subnet, 3, 2), cidrsubnet(var.cidr_subnet, 3, 0), cidrsubnet(var.cidr_subnet, 3, 1)]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support = true

  manage_default_network_acl    = true
  default_network_acl_tags      = { Name = "${local.cluster_name}-default" }
  manage_default_route_table    = true
  default_route_table_tags      = { Name = "${local.cluster_name}-default" }
  manage_default_security_group = true
  default_security_group_tags   = { Name = "${local.cluster_name}-default" }

  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = 1
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"             = 1
  }
}
