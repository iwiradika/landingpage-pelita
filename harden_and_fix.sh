#!/bin/bash

# Configuration
SERVER_IP="103.16.117.181"
SERVER_USER="root"
SERVER_PASS="#UNDIKSHAharmon1"
DOMAIN="pelita-framework.cloud"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[+] $1${NC}"; }
err() { echo -e "${RED}[!] $1${NC}"; }

log "Starting Advanced Hardening & Favicon Fix on $SERVER_IP..."

sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
    set -e
    export DEBIAN_FRONTEND=noninteractive
    
    # 1. SETUP RATE LIMITING (Global Context)
    log() { echo -e "\033[0;32m[+] \$1\033[0m"; }
    
    log "Configuring Nginx Rate Limiting Zones..."
    cat > /etc/nginx/conf.d/00-security_zones.conf << 'CONF'
# Rate Limiting Zones
# Limit requests based on IP - 10 requests/second with a burst of 20
limit_req_zone \$binary_remote_addr zone=pelita_general:10m rate=10r/s;
# stricter limit for login/sensitive paths if needed (not applied yet)
limit_req_zone \$binary_remote_addr zone=pelita_strict:10m rate=1r/s;
CONF

    # 2. UPDATE NGINX CONFIGURATION
    log "Updating Site Configuration (Security + Favicon Fix)..."
    cat > /etc/nginx/sites-available/pelita-landing << 'NGINXCONF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # --- SECURITY HEADERS (HSTS, XSS, etc.) ---
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # --- RATE LIMITING ---
    # Apply global rate limit
    limit_req zone=pelita_general burst=20 nodelay;

    # --- FAVICON FIX ---
    # Explicitly serve the favicon from the public directory
    # and turn off logging for it to reduce noise
    location = /pavicon_pelitamodel.png {
        alias /var/www/pelita-landing/public/pavicon_pelitamodel.png;
        access_log off;
        expires 1y;
    }
    
    # Also handle standard favicon.ico just in case browsers ask for it
    location = /favicon.ico {
        alias /var/www/pelita-landing/public/pavicon_pelitamodel.png; # Fallback to our png
        access_log off;
        expires 1y;
    }

    # --- STATIC FILES OPTIMIZATION ---
    # Serve static files directly via Nginx for performance
    location /_next/static {
        alias /var/www/pelita-landing/.next/static;
        expires 365d;
        access_log off;
    }

    location /public {
        alias /var/www/pelita-landing/public;
        expires 365d;
        access_log off;
    }

    # --- MAIN APP PROXY ---
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

    # --- BLOCK SENSITIVE FILES ---
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINXCONF

    # 3. CONFIGURE FAIL2BAN (Intrusion Prevention)
    log "Configuring Fail2Ban..."
    
    # Create local jail configuration
    cat > /etc/fail2ban/jail.local << 'JAIL'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
maxretry = 3

[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true
port     = http,https
logpath  = /var/log/nginx/access.log
maxretry = 2
JAIL

    # 4. RESTART SERVICES
    log "Applying changes..."
    nginx -t
    systemctl restart nginx
    systemctl restart fail2ban

    # 5. FINAL PERMISSIONS CHECK
    log "Ensuring correct file permissions..."
    chown -R pelita:pelita /var/www/pelita-landing
    # Ensure Public files are readable by everyone (including Nginx user)
    chmod -R 755 /var/www/pelita-landing/public

    log "Security Hardening & Fixes Applied!"
EOF
