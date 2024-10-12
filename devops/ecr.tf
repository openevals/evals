resource "aws_ecr_repository" "openevals_deployment" {
  name = "openevals-deployment"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
