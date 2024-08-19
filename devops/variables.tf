####
# General variables
####
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-1"
}

variable "zones" {
  description = "AWS Availability Zones"
  type        = list(string)
  default     = ["usw1-az1", "usw1-az2", "usw1-az3"]
}

variable "cidr_subnet" {
  description = "CIDR Subnet for the cluster"
  type        = string
}
variable "environment" {
  description = "Cluster environment"
  type        = string
  default     = "dev"
}
variable "users_arns" {
  description = "User list with admin access to the cluster"
  type        = list(string)
}


####
# Define cluster node groups
####
variable "general_processing" {
  description = "Cluster node groups definition"
  type = object({
    instance_types = list(string)
    desired_size   = number
    min_size       = number
    max_size       = number
  })
}

####
# Define RDS variables
####
variable "db_password" {
  description = "PostgreSQL DB password"
  type        = string
}
