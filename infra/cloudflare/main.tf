data "cloudflare_zone" "this" {
  name = var.zone_name
}

resource "cloudflare_dns_record" "root" {
  count   = var.create_root_record ? 1 : 0
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "@"
  type    = "CNAME"
  content = var.pages_project_hostname
  ttl     = 1
  proxied = true
}

resource "cloudflare_dns_record" "www" {
  count   = var.create_www_record ? 1 : 0
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "www"
  type    = "CNAME"
  content = var.pages_project_hostname
  ttl     = 1
  proxied = true
}
