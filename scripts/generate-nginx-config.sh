#!/bin/bash
set -e

APP_DIR="/opt/vehicle-tracker"
DOMAIN="${1:-localhost}"

echo "Generating nginx config for domain: $DOMAIN"

# Check if SSL certificates exist and are valid
SSL_AVAILABLE=false
if [ -f "$APP_DIR/nginx/ssl/fullchain.pem" ] && [ -f "$APP_DIR/nginx/ssl/privkey.pem" ]; then
    if openssl x509 -in "$APP_DIR/nginx/ssl/fullchain.pem" -checkend 86400 -noout 2>/dev/null; then
        echo "Valid SSL certificates found, generating HTTPS config"
        SSL_AVAILABLE=true
    else
        echo "SSL certificates found but invalid/expired, using HTTP-only config"
    fi
else
    echo "No SSL certificates found, generating HTTP-only config"
fi

# Generate nginx config
cat > "$APP_DIR/nginx/nginx.conf" << EOF
events {
    worker_connections 1024;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Upstream definitions
    upstream backend {
        server backend:3000 max_fails=3 fail_timeout=30s;
    }

    upstream frontend {
        server frontend:80 max_fails=3 fail_timeout=30s;
    }

    # HTTP server
    server {
        listen 80;
        server_name ${DOMAIN} www.${DOMAIN} _;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
EOF

# Add SSL redirect or direct proxy based on SSL availability
if [ "$SSL_AVAILABLE" = true ]; then
    # HTTPS available - redirect HTTP to HTTPS
    cat >> "$APP_DIR/nginx/nginx.conf" << 'EOF'
        
        # Redirect HTTP to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
EOF
    echo "        server_name ${DOMAIN} www.${DOMAIN};" >> "$APP_DIR/nginx/nginx.conf"
    cat >> "$APP_DIR/nginx/nginx.conf" << 'EOF'

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        location = /api-docs {
            return 301 /api-docs/;
        }

        location ^~ /api-docs/ {
            proxy_pass http://backend/api-docs/;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API documentation assets
        location ^~ /api-docs/(.*) {
            proxy_pass http://backend/api-docs/$1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location ^~ /api/ {
            proxy_pass http://backend;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API endpoints
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend - catch all remaining requests
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
EOF
else
    # No HTTPS - serve directly on HTTP
    cat >> "$APP_DIR/nginx/nginx.conf" << 'EOF'
        
        # API documentation - must come first to avoid being caught by /api/
        location = /api-docs {
            return 301 /api-docs/;
        }

        location ^~ /api-docs/ {
            proxy_pass http://backend/api-docs/;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API documentation assets
        location ^~ /api-docs/(.*) {
            proxy_pass http://backend/api-docs/$1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location ^~ /api/ {
            proxy_pass http://backend;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API endpoints
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend - catch all remaining requests
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
EOF
fi

# Close the http block
echo "}" >> "$APP_DIR/nginx/nginx.conf"

echo "Nginx config generated successfully"
echo "SSL available: $SSL_AVAILABLE"

# Test the generated config
if command -v nginx >/dev/null 2>&1; then
    echo "Testing nginx configuration..."
    nginx -t -c "$APP_DIR/nginx/nginx.conf" || echo "Warning: nginx config test failed"
fi