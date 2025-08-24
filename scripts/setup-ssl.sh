#!/bin/bash
set -e

APP_DIR="/opt/vehicle-tracker"
DOMAIN="${1:-}"

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "example.com" ]; then
    echo "No valid domain provided, skipping SSL setup"
    exit 0
fi

echo "Setting up SSL for domain: $DOMAIN"

# Create SSL directory
mkdir -p "$APP_DIR/nginx/ssl"

# Skip if certificates already exist
if [ -f "$APP_DIR/nginx/ssl/fullchain.pem" ]; then
    echo "SSL certificates already exist"
    exit 0
fi

# Install certbot if needed
if ! command -v certbot >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y certbot
fi

# Stop nginx to free port 80
docker compose -f "$APP_DIR/docker-compose.prod.yml" stop nginx 2>/dev/null || true

# Try Let's Encrypt first
if certbot certonly --standalone --non-interactive --agree-tos \
    --email "admin@${DOMAIN}" -d "${DOMAIN}" -d "www.${DOMAIN}"; then
    
    echo "Let's Encrypt certificates generated successfully"
    cp "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "$APP_DIR/nginx/ssl/"
    cp "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" "$APP_DIR/nginx/ssl/"
else
    echo "Let's Encrypt failed, generating self-signed certificate"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$APP_DIR/nginx/ssl/privkey.pem" \
        -out "$APP_DIR/nginx/ssl/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"
fi

echo "SSL setup complete"