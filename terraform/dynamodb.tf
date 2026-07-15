resource "aws_dynamodb_table" "locations" {
  name         = "${var.project_name}-locations"
  billing_mode = "PAY_PER_REQUEST" # free-tier friendly, no idle capacity cost
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Project = var.project_name
  }
}