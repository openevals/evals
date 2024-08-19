###
# Create AWS load balancer policy
# https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html
###
data "http" "openevals_balancer_policy_url" {
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json"
}
resource "aws_iam_policy" "openevals_load_balancer_policy" {
  name        = "openevals-${var.environment}-AWSLoadBalancerControllerIAMPolicy"
  path        = "/"
  description = "AWS Load Balancer Controller Policy"
  policy      = data.http.openevals_balancer_policy_url.response_body
}

###
# Prepare the settings for the service account
### 
module "openevals_load_balancer_service_account" {
  source                 = "./modules/irsa"
  create_namespace       = false
  namespace              = "kube-system"
  create_service_account = true
  service_account        = "aws-load-balancer-controller"
  cluster_id             = module.eks.cluster_id
  oidc_provider_arn      = module.eks.oidc_provider_arn
  iam_policies           = [aws_iam_policy.openevals_load_balancer_policy.arn]
  managed_by             = "Helm"
  helm_release_name      = "aws-load-balancer-controller"
  helm_release_namespace = "kube-system"
  providers = {
    aws = aws
    kubernetes = kubernetes
  }
  depends_on = [
    module.eks.cluster_endpoint
  ]
}

###
# Deploy AWS Load Balancer using Helm
# https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html
###
resource "helm_release" "openevals_aws_load_balancer" {
  provider   = helm.openevals_cluster
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = "1.8.2"

  depends_on = [
    module.openevals_load_balancer_service_account
  ]

  set {
    name  = "region"
    value = var.region
  }

  set {
    name  = "vpcId"
    value = module.vpc.vpc_id
  }

  set {
    name  = "image.repository"
    value = "602401143452.dkr.ecr.${var.region}.amazonaws.com/amazon/aws-load-balancer-controller"
  }

  set {
    name  = "serviceAccount.create"
    value = "false"
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  set {
    name  = "clusterName"
    value = module.eks.cluster_name
  }

  set {
    name  = "serviceAccount\\.server\\.annotations\\.eks\\.amazonaws\\.com/role-arn"
    value = module.openevals_load_balancer_service_account.iam_role_arn
  }
}
