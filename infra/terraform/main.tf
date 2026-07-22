# Infraestructura Cloudflare como código (OPCIONAL — no aplicado aún).
#
# Documenta la configuración del túnel que hoy existe creada a mano en el
# dashboard. Para adoptarla con Terraform:
#   1. Crear un API Token en Cloudflare (permisos: Account.Cloudflare Tunnel,
#      Zone.DNS) y exportarlo: export CLOUDFLARE_API_TOKEN=...
#   2. terraform init
#   3. Importar los recursos existentes en lugar de recrearlos:
#      terraform import cloudflare_zero_trust_tunnel_cloudflared.pi <account_id>/<tunnel_id>
#   4. terraform plan  (debe salir sin cambios)

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Zone ID de kawashiro.dev"
  type        = string
}

# Túnel existente: kawashiroserver-pi
resource "cloudflare_zero_trust_tunnel_cloudflared" "pi" {
  account_id = var.account_id
  name       = "kawashiroserver-pi"
  # El secreto se gestiona vía token en la Pi (.env), no en Terraform.
}

# Ruta pública: kawashiro.dev -> http://frontend:80 (red interna de Docker)
resource "cloudflare_zero_trust_tunnel_cloudflared_config" "pi" {
  account_id = var.account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.pi.id

  config {
    ingress_rule {
      hostname = "kawashiro.dev"
      service  = "http://frontend:80"
    }
    # Regla de cierre obligatoria
    ingress_rule {
      service = "http_status:404"
    }
  }
}

# DNS: CNAME proxied del apex hacia el túnel
resource "cloudflare_record" "apex" {
  zone_id = var.zone_id
  name    = "@"
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.pi.id}.cfargotunnel.com"
  proxied = true
}
