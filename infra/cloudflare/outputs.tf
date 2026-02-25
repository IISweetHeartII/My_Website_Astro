output "zone_id" {
  value = data.cloudflare_zone.this.zone_id
}

output "root_record_id" {
  value = try(cloudflare_dns_record.root[0].id, null)
}

output "www_record_id" {
  value = try(cloudflare_dns_record.www[0].id, null)
}
