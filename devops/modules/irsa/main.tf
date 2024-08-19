locals {
  oidc_issuer_url = replace(var.oidc_provider_arn, "/^(.*provider/)/", "")
}

###
# Create the new namespace if its required
###
resource "kubernetes_namespace_v1" "irsa" {
  count = var.create_namespace && var.namespace != "kube-system" ? 1 : 0
  metadata {
    name = var.namespace
  }
  timeouts {
    delete = "15m"
  }
}

###
# Create the IAM role
###
resource "aws_iam_role" "irsa" {
  count = var.iam_policies != null ? 1 : 0

  name        = try(coalesce(var.iam_role_name, format("%s-%s-%s", var.cluster_id, trim(var.service_account, "-*"), "irsa")), null)
  description = "AWS IAM Role for the Kubernetes service account ${var.service_account}."
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Federated" : var.oidc_provider_arn
        },
        "Action" : "sts:AssumeRoleWithWebIdentity",
        "Condition" : {
          "StringLike" : {
            "${local.oidc_issuer_url}:sub" : "system:serviceaccount:${var.namespace}:${var.service_account}",
            "${local.oidc_issuer_url}:aud" : "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  path                  = var.iam_role_path
  force_detach_policies = true
  permissions_boundary  = var.iam_permissions_boundary

  tags = var.tags
}

###
# Attach the policies to the role
###
resource "aws_iam_role_policy_attachment" "irsa" {
  count      = var.iam_policies != null ? length(var.iam_policies) : 0
  policy_arn = var.iam_policies[count.index]
  role       = aws_iam_role.irsa[0].name
}


###
# Create the new service account if its required
###
resource "kubernetes_manifest" "irsa_service_account" {
  count    = var.create_service_account ? 1 : 0
  manifest = {
    "apiVersion" = "v1"
    "kind"       = "ServiceAccount"
    "metadata" = {
      "annotations" = {
        "eks.amazonaws.com/role-arn"     = "${aws_iam_role.irsa[0].arn}"
        "meta.helm.sh/release-name"      = var.helm_release_name
        "meta.helm.sh/release-namespace" = var.helm_release_namespace
      }
      "labels" = {
        "app.kubernetes.io/component"  = "${var.service_account_component}"
        "app.kubernetes.io/name"       = "${var.service_account}"
        "app.kubernetes.io/managed-by" = "${var.managed_by}"
      }
      "name"      = "${var.service_account}"
      "namespace" = "${try(kubernetes_namespace_v1.irsa[0].metadata[0].name, var.namespace)}"
    }
  }
  depends_on = [
    aws_iam_role.irsa,
    aws_iam_role_policy_attachment.irsa
  ]
}