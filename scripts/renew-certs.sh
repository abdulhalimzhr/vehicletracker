#!/bin/bash
set -e

APP_DIR="/opt/vehicle-tracker"
DOMAIN="${DOMAIN:-}"

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "example.com" ]; then
    echo "No valid domain configured for renewal"
    exit 0
fi

echo "Renewing certificates for $DOMAIN"

cd "$APP_DIR"

# Stop nginx to free port 80
docker compose -f docker-compose.prod.yml stop nginx

# Renew certificates
if certbot renew --standalone --quiet; then
    echo "Certificates renewed successfully"
    
    # Copy renewed certificates
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$APP_DIR/nginx/ssl/"
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$APP_DIR/nginx/ssl/"
        echo "Certificates copied to nginx directory"
    fi
else
    echo "Certificate renewal failed or not needed"
fi

# Restart nginx
docker compose -f docker-compose.prod.yml start nginx

echo "Certificate renewal process complete"