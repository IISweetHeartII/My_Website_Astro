variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "zone_name" {
  type = string
}

variable "pages_project_hostname" {
  type = string
}

variable "create_root_record" {
  type    = bool
  default = true
}

variable "create_www_record" {
  type    = bool
  default = true
}
