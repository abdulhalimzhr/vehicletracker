#!/bin/bash

APP_DIR="/opt/vehicle-tracker"

echo "=== Nginx Debug Information ==="
echo "Date: $(date)"
echo

echo "1. Container Status:"
docker compose -f "$APP_DIR/docker-compose.prod.yml" ps
echo

echo "2. Nginx Container Logs (last 20 lines):"
docker compose -f "$APP_DIR/docker-compose.prod.yml" logs --tail=20 nginx
echo

echo "3. Nginx Configuration:"
if [ -f "$APP_DIR/nginx/nginx.conf" ]; then
    echo "Config file exists, showing content:"
    cat "$APP_DIR/nginx/nginx.conf"
else
    echo "ERROR: nginx.conf not found!"
fi
echo

echo "4. SSL Certificates:"
if [ -f "$APP_DIR/nginx/ssl/fullchain.pem" ]; then
    echo "SSL certificate exists:"
    openssl x509 -in "$APP_DIR/nginx/ssl/fullchain.pem" -text -noout | grep -E "(Subject:|Not After:|Issuer:)" || true
else
    echo "No SSL certificate found"
fi
echo

echo "5. Port Status:"
netstat -tlnp | grep -E ":80|:443" || echo "No HTTP/HTTPS ports found"
echo

echo "6. Nginx Config Test:"
docker compose -f "$APP_DIR/docker-compose.prod.yml" exec nginx nginx -t || echo "Nginx config test failed"
echo

echo "7. Test Local Connectivity:"
echo "HTTP test:"
curl -I -m 5 http://localhost/ 2>&1 || echo "HTTP connection failed"
echo
echo "HTTPS test:"
curl -I -k -m 5 https://localhost/ 2>&1 || echo "HTTPS connection failed"
echo

echo "8. Environment Variables:"
echo "DOMAIN: ${DOMAIN:-not set}"
echo

echo "=== End Debug Information ==="