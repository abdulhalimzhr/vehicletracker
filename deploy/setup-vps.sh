#!/bin/bash

set -e

# Configuration variables
DOMAIN=${1:-"your-domain.com"}
DOCKER_USERNAME=${2:-"your-docker-username"}

if [ "$DOMAIN" = "your-domain.com" ]; then
    echo "Usage: $0 <domain> [docker-username]"
    echo "Example: $0 tracker.example.com myusername"
    exit 1
fi

echo "Setting up Vehicle Tracker on Ubuntu VPS..."
echo "Domain: $DOMAIN"
echo "Docker Username: $DOCKER_USERNAME"

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Certbot for SSL
sudo apt install -y certbot

# Create application directory
sudo mkdir -p /opt/vehicle-tracker
sudo chown $USER:$USER /opt/vehicle-tracker
cd /opt/vehicle-tracker

# Create environment file
cat > .env << EOF
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
DOCKER_USERNAME=$DOCKER_USERNAME
DOMAIN=$DOMAIN
EOF

# Download docker-compose files
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/your-repo/vehicle-tracker/main/docker-compose.prod.yml

# Download and process nginx configuration
curl -o nginx.conf.template https://raw.githubusercontent.com/your-repo/vehicle-tracker/main/nginx/nginx.conf
envsubst '${DOMAIN}' < nginx.conf.template > nginx/nginx.conf
rm nginx.conf.template

# Create nginx and SSL directories
mkdir -p nginx/ssl

# Generate SSL certificate
echo "Generating SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/vehicle-tracker/nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/vehicle-tracker/nginx/ssl/
sudo chown -R $USER:$USER /opt/vehicle-tracker/nginx/ssl/

# Create systemd service
sudo tee /etc/systemd/system/vehicle-tracker.service > /dev/null << EOF
[Unit]
Description=Vehicle Tracker Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/vehicle-tracker
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable vehicle-tracker
sudo systemctl start vehicle-tracker

# Setup SSL renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl restart vehicle-tracker" | sudo crontab -

echo "Setup complete! Your Vehicle Tracker application should be running at https://$DOMAIN"
echo "Don't forget to:"
echo "1. Configure your DNS to point $DOMAIN to this server"
echo "2. Wait for DNS propagation before running this script"
echo "3. Make sure ports 80 and 443 are open in your firewall"