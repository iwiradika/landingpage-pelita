#!/bin/bash

# Configuration
SERVER_IP="103.16.117.181"
SERVER_USER="root"
SERVER_PASS="#UNDIKSHAharmon1" 
DOMAIN="pelita-framework.cloud"
APP_NAME="pelita-landing"
EMAIL="admin@pelita-framework.cloud" # Email for Let's Encrypt renewal

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[+] $1${NC}"; }
err() { echo -e "${RED}[!] $1${NC}"; }

log "Configuring Domain & SSL for $DOMAIN on $SERVER_IP..."

sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
    set -e
    export DEBIAN_FRONTEND=noninteractive
    
    # 1. Update Nginx Configuration for Domain
    log() { echo -e "\033[0;32m[+] \$1\033[0m"; }
    
    log "Updating Nginx configuration..."
    cat > /etc/nginx/sites-available/$APP_NAME << 'NGINXCONF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Real IP handling
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Pavicon handling
    location = /pavicon_pelitamodel.png {
        alias /var/www/pelita-landing/public/pavicon_pelitamodel.png;
    }
}
NGINXCONF

    # Reload Nginx to apply changes before Certbot
    nginx -t
    systemctl reload nginx

    # 2. Install Certbot
    if ! command -v certbot &> /dev/null; then
        log "Installing Certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi

    # 3. Obtain SSL Certificate
    log "Obtaining SSL Certificate (this handles HTTPS redirection automatically)..."
    
    # Check if certificate already exists to avoid rate limits/errors on re-run
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        log "Certificate already exists. Attempting renewal..."
        certbot renew --noninteractive
    else
        certbot --nginx \
            --non-interactive \
            --agree-tos \
            -m $EMAIL \
            -d $DOMAIN \
            -d www.$DOMAIN \
            --redirect
    fi
    
    # 4. Final Nginx Check
    nginx -t
    systemctl restart nginx
    
    log "SSL Setup Complete!"
EOF
