#!/bin/bash

# PELITA VPS Deployment Script
# This script should be run on your VPS server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="pelita-app"
APP_DIR="/var/www/pelita"
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"  # Update this
BRANCH="main"
NODE_VERSION="20"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please don't run this script as root"
    exit 1
fi

# Initial VPS Setup
setup_vps() {
    log_info "Starting VPS setup..."
    
    # Update system
    log_info "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Install required packages
    log_info "Installing required packages..."
    sudo apt install -y curl wget git nginx ufw fail2ban
    
    # Install Node.js
    log_info "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install PM2
    log_info "Installing PM2..."
    sudo npm install -g pm2
    
    # Setup firewall
    log_info "Configuring firewall..."
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    
    # Create app directory
    log_info "Creating application directory..."
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    log_success "VPS setup completed!"
}

# Deploy application
deploy_app() {
    log_info "Starting application deployment..."
    
    # Clone or update repository
    if [ -d "$APP_DIR/.git" ]; then
        log_info "Updating existing repository..."
        cd $APP_DIR
        git fetch origin
        git reset --hard origin/$BRANCH
        git clean -fd
    else
        log_info "Cloning repository..."
        git clone -b $BRANCH $REPO_URL $APP_DIR
        cd $APP_DIR
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production
    
    # Build application
    log_info "Building application..."
    npm run build
    
    # Create PM2 ecosystem file if not exists
    if [ ! -f "$APP_DIR/ecosystem.config.js" ]; then
        log_info "Creating PM2 ecosystem configuration..."
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
    fi
    
    # Start or restart application with PM2
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        log_info "Restarting application..."
        pm2 restart $APP_NAME
    else
        log_info "Starting application..."
        pm2 start ecosystem.config.js
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
    
    log_success "Application deployed successfully!"
}

# Configure Nginx
setup_nginx() {
    local domain=${1:-localhost}
    
    log_info "Configuring Nginx for domain: $domain"
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/pelita << EOF
server {
    listen 80;
    server_name $domain www.$domain;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
    
    # Next.js static files
    location /_next/static/ {
        alias $APP_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Public static files
    location /public/ {
        alias $APP_DIR/public/;
        expires 1m;
        add_header Cache-Control "public";
        access_log off;
    }
    
    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/pelita /etc/nginx/sites-enabled/
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    sudo nginx -t
    
    # Restart nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log_success "Nginx configured successfully!"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    local domain=$1
    
    if [ -z "$domain" ]; then
        log_warning "No domain provided, skipping SSL setup"
        return
    fi
    
    log_info "Setting up SSL certificate for: $domain"
    
    # Install certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Get certificate
    sudo certbot --nginx -d $domain -d www.$domain --non-interactive --agree-tos --email admin@$domain
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
    
    log_success "SSL certificate installed successfully!"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create monitoring script
    cat > ~/monitor.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/pelita-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if application is running
if pm2 describe pelita-app > /dev/null 2>&1; then
    STATUS="RUNNING"
else
    STATUS="STOPPED"
    pm2 restart pelita-app
fi

# Get system stats
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

# Log stats
echo "[$DATE] Status: $STATUS, CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%" >> $LOG_FILE
EOF
    
    chmod +x ~/monitor.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * ~/monitor.sh") | crontab -
    
    # Create backup script
    cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/pelita"

mkdir -p $BACKUP_DIR

# Backup application
tar -czf "$BACKUP_DIR/pelita_app_$DATE.tar.gz" -C /var/www pelita

# Backup nginx config
sudo tar -czf "$BACKUP_DIR/nginx_config_$DATE.tar.gz" /etc/nginx/sites-available/pelita

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE" >> /var/log/backup.log
EOF
    
    chmod +x ~/backup.sh
    
    # Add backup to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * ~/backup.sh") | crontab -
    
    log_success "Monitoring setup completed!"
}

# Main deployment function
main() {
    local command=${1:-"deploy"}
    local domain=$2
    
    case $command in
        "setup")
            setup_vps
            ;;
        "deploy")
            deploy_app
            ;;
        "nginx")
            setup_nginx $domain
            ;;
        "ssl")
            setup_ssl $domain
            ;;
        "monitor")
            setup_monitoring
            ;;
        "full")
            log_info "Running full deployment setup..."
            setup_vps
            deploy_app
            setup_nginx $domain
            setup_monitoring
            if [ ! -z "$domain" ]; then
                setup_ssl $domain
            fi
            log_success "Full deployment completed!"
            ;;
        "status")
            log_info "Checking application status..."
            pm2 status
            sudo systemctl status nginx --no-pager -l
            ;;
        "logs")
            log_info "Showing application logs..."
            pm2 logs pelita-app --lines 50
            ;;
        "restart")
            log_info "Restarting application..."
            pm2 restart pelita-app
            sudo systemctl reload nginx
            log_success "Application restarted!"
            ;;
        *)
            echo "Usage: $0 {setup|deploy|nginx|ssl|monitor|full|status|logs|restart} [domain]"
            echo ""
            echo "Commands:"
            echo "  setup     - Initial VPS setup (install Node.js, PM2, Nginx, etc.)"
            echo "  deploy    - Deploy application from Git"
            echo "  nginx     - Configure Nginx (requires domain)"
            echo "  ssl       - Setup SSL certificate (requires domain)"
            echo "  monitor   - Setup monitoring and backup scripts"
            echo "  full      - Run complete deployment (setup + deploy + nginx + monitor + ssl)"
            echo "  status    - Check application and service status"
            echo "  logs      - Show application logs"
            echo "  restart   - Restart application and nginx"
            echo ""
            echo "Examples:"
            echo "  $0 setup"
            echo "  $0 full yourdomain.com"
            echo "  $0 deploy"
            echo "  $0 ssl yourdomain.com"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"