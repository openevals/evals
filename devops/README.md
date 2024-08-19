# OpenEvals Devops

This document outlines the automation of deployment and software development process management. It is crucial to note that only one team member can apply Terraform changes at a time. If multiple people attempt to apply changes simultaneously, it will disrupt the system.

## Setup

Please be aware that applying Terraform changes can be time-consuming. Once all settings are applied, the resulting cluster will include the following elements:

- A node group named `general-processing`.
- AWS Load Balancer Controller.
- Kube Proxy addon.
- VPC CNI addon.
- CoreDNS addon.
- RDS PostgreSQL database: `openevals`.

1. Add the AWS IAM credentials key to the `~/.aws/credentials` file, creating it if it does not exist.

```
[default]
aws_access_key_id=<insert key id>
aws_secret_access_key=<insert key secret>
region=us-west-1
```

2. Install [Terraform v1.9.4](https://www.terraform.io/downloads).

3. Initialize the terraform environment.

```
cd devops
terraform init
```

4. Create the variables file `prod-vard.tfvars`.

```
####
# General variables
####
region = "us-west-1"
zones = ["usw1-az1", "usw1-az3"]
cidr_subnet = "10.0.0.0/16"
environment = "prod"
users_arns = [
    <include arns for all admin users in the cluster>
]

####
# Define cluster node groups
####
general_processing = {
    instance_types = ["t3a.small"]
    desired_size   = 3
    min_size       = 1
    max_size       = 10
}

####
# Define RDS variables
####
db_password = <database password>

```

5. Create a Terraform plan for the cluster module in the workspace. This module must be created first due to its dependencies on other components.

```
terraform plan -out=prod.plan --var-file=prod-vars.tfvars -target=module.eks
```

6. After carefully reviewing the plan, execute the apply command.

```
terraform apply "prod.plan"
```

7. Once the cluster is established, create a new plan in the Terraform workspace without specifying any target.

```
terraform plan -out=prod.plan --var-file=prod-vars.tfvars
```

8. After carefully reviewing the plan, execute the apply command.

```
terraform apply "prod.plan"
```

## Destroying the EKS cluster

Should you need to dismantle the EKS cluster for any reason, you can use the following command:

```
terraform destroy --var-file=prod-vars.tfvars
```

**NOTE: REMOVING THE CLUSTER WILL RESULT IN THE LOST OF ALL CONFIGURATIONS.**
