#!/bin/bash

# Configuration
SERVER_IP="103.16.117.181"
SERVER_USER="root"
SERVER_PASS="#UNDIKSHAharmon1" # Use strictly for this session. Recommended: Setup SSH Keys.
APP_NAME="pelita-landing"
APP_USER="pelita"
REMOTE_DIR="/var/www/pelita-landing"
LOCAL_DIR="$(pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[+] $1${NC}"; }
err() { echo -e "${RED}[!] $1${NC}"; }

# Check for sshpass
if ! command -v sshpass &> /dev/null; then
    err "sshpass could not be found. Please install it (brew install sshpass) or use SSH keys."
    exit 1
fi

log "Starting Secure Deployment to $SERVER_IP..."

# 1. SYSTEM UPDATE (Separate step as it might restart SSH)
log "Updating system (this might take a while and disconnect)..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "export DEBIAN_FRONTEND=noninteractive; apt-get update && apt-get upgrade -y" || log "Update finished (or connection reset, continuing...)"

# 2. CONFIGURATION & HARDENING
log "Configuring server and installing dependencies..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
    set -e
    export DEBIAN_FRONTEND=noninteractive
    
    # Install Essentials
    apt-get install -y curl git ufw fail2ban nginx build-essential
    
    # --- SECURITY HARDENING ---
    
    # 1. Firewall (UFW) - Block Outgoing UDP to prevent Abuse
    # Reset to default
    echo "y" | ufw reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Specific blocking for UDP Flood (Abuse Report Mitigation)
    # Block all outgoing UDP by default
    ufw deny out to any proto udp
    # Allow DNS (53) and NTP (123)
    ufw allow out to any port 53 proto udp
    ufw allow out to any port 123 proto udp
    
    # Allow Incoming Services
    ufw allow ssh
    ufw allow 'Nginx Full'
    
    # Enable Firewall
    echo "y" | ufw enable
    
    # 2. Create dedicated user if not exists
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash $APP_USER
        echo "$APP_USER ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
    fi
    
    # 3. Install Node.js (v20)
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    # 4. Install PM2
    npm install -g pm2
    
    # Create App Directory
    mkdir -p $REMOTE_DIR
    chown -R $APP_USER:$APP_USER $REMOTE_DIR
EOF


if [ $? -ne 0 ]; then
    err "Server setup failed."
    exit 1
fi

# 2. UPLOAD FILES
log "Uploading files to server..."
# Exclude node_modules, .next, .git to save time and bandwidth
sshpass -p "$SERVER_PASS" rsync -avz -e "ssh -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.env*' "$LOCAL_DIR/" $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

# Fix permissions again after upload
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP "chown -R $APP_USER:$APP_USER $REMOTE_DIR"

# 3. BUILD & START APP
log "Building and starting application..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << EOF
    set -e
    su - $APP_USER
    cd $REMOTE_DIR
    
    # Install Dependencies
    npm install --production=false # Need dev deps to build
    
    # Build
    npm run build
    
    # Prune dev dependencies for production
    npm prune --production
    
    # Start with PM2
    pm2 delete $APP_NAME || true
    pm2 start npm --name "$APP_NAME" -- start -- --port 3000
    pm2 save
EOF

# 4. CONFIGURE NGINX
log "Configuring Nginx..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << EOF
    set -e
    
    cat > /etc/nginx/sites-available/$APP_NAME << 'NGINXCONF'
server {
    listen 80;
    server_name _;  # Respond to IP address since domain wasn't specified

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Pavicon handling (Direct mapping if needed, though Next.js handles it)
    location = /pavicon_pelitamodel.png {
        alias $REMOTE_DIR/public/pavicon_pelitamodel.png;
    }
}
NGINXCONF

    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
EOF

log "Deployment Complete! Your site should be accessible at http://$SERVER_IP"
log "Security Note: Outgoing UDP traffic has been blocked to prevent future abuse reports."
