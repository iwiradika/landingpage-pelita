# 🚀 PELITA - Panduan Deployment GitHub ke VPS

Panduan lengkap untuk deployment otomatis aplikasi PELITA dari GitHub ke VPS menggunakan GitHub Actions.

## 📋 Daftar Isi

- [Quick Start](#quick-start)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Setup GitHub Repository](#setup-github-repository)
- [Setup VPS](#setup-vps)
- [GitHub Actions Deployment](#github-actions-deployment)
- [Manual Deployment](#manual-deployment)
- [Maintenance](#maintenance)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

## ⚡ Quick Start

### 1. Upload ke GitHub
```bash
# Inisialisasi Git repository (jika belum ada)
git init
git add .
git commit -m "Initial commit"

# Tambahkan remote GitHub
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

### 2. Setup VPS (One-time)
```bash
# Download dan jalankan script deployment
curl -O https://raw.githubusercontent.com/USERNAME/REPO-NAME/main/deploy.sh
chmod +x deploy.sh
./deploy.sh full yourdomain.com
```

### 3. Configure GitHub Secrets
Tambahkan secrets berikut di GitHub repository Anda (`Settings` → `Secrets and variables` → `Actions`):
- `VPS_HOST`: IP address VPS Anda
- `VPS_USERNAME`: Username SSH VPS 
- `VPS_SSH_KEY`: Private SSH key untuk akses VPS
- `VPS_PORT`: SSH port (default: 22)

### 4. Deploy Otomatis
Setiap push ke branch `main` akan otomatis deploy ke VPS!

## 🖥️ Persyaratan Sistem

### Minimum Requirements
- **CPU**: 1 vCPU
- **RAM**: 1GB (2GB recommended)
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS atau yang lebih baru
- **Network**: 1Gbps

### Recommended Requirements
- **CPU**: 2 vCPU
- **RAM**: 4GB
- **Storage**: 40GB SSD
- **OS**: Ubuntu 22.04 LTS

## 🐙 Setup GitHub Repository

### 1. Buat Repository di GitHub
1. Buka [GitHub](https://github.com) dan buat repository baru
2. Jangan inisialisasi dengan README, .gitignore, atau license (karena project sudah ada)
3. Copy URL repository yang dibuat

### 2. Upload Project ke GitHub
```bash
# Masuk ke direktori project
cd /path/to/pelita-landingpage

# Inisialisasi git (jika belum)
git init

# Tambah semua file
git add .

# Commit pertama
git commit -m "Initial commit: PELITA landing page"

# Tambahkan remote GitHub (ganti URL dengan repository Anda)
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Push ke GitHub
git push -u origin main
```

### 3. Setup GitHub Secrets
Buka repository di GitHub → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Tambahkan secrets berikut:
- `VPS_HOST`: IP address VPS Anda (contoh: `192.168.1.100`)
- `VPS_USERNAME`: Username SSH VPS (contoh: `ubuntu` atau `root`)
- `VPS_SSH_KEY`: Private SSH key (isi file `~/.ssh/id_rsa`)
- `VPS_PORT`: SSH port (default: `22`)

### 4. Generate SSH Key (jika belum ada)
```bash
# Di local machine
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key ke VPS
ssh-copy-id username@vps-ip-address

# Copy private key untuk GitHub secret
cat ~/.ssh/id_rsa
```

## 🔧 Setup VPS

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 4. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Install SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6. Setup Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 🚀 GitHub Actions Deployment

### Otomatis Deployment
GitHub Actions workflow akan otomatis:
1. ✅ Install Node.js dan dependencies
2. ✅ Build aplikasi
3. ✅ Deploy ke VPS via SSH
4. ✅ Restart PM2 process
5. ✅ Health check

### Workflow Triggers
- Push ke branch `main` atau `master`
- Pull request ke branch `main` atau `master`

### Status Deployment
- Cek status di tab `Actions` di GitHub repository
- Logs detail tersedia untuk debugging

## 📝 Manual Deployment

### Using Deployment Script (Recommended)
```bash
# Download deployment script
curl -O https://raw.githubusercontent.com/USERNAME/REPO-NAME/main/deploy.sh
chmod +x deploy.sh

# Full setup (one-time)
./deploy.sh full yourdomain.com

# Or step by step:
./deploy.sh setup          # Initial VPS setup
./deploy.sh deploy         # Deploy application  
./deploy.sh nginx yourdomain.com  # Configure Nginx
./deploy.sh ssl yourdomain.com    # Setup SSL
./deploy.sh monitor        # Setup monitoring
```

### Manual Steps

#### 1. Clone Repository
```bash
cd /var/www/
sudo mkdir pelita
sudo chown $USER:$USER pelita
cd pelita

# Clone your repository (ganti dengan URL repository Anda)
git clone https://github.com/USERNAME/REPO-NAME.git .
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Build Application
```bash
npm run build
```

### 4. Setup PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'pelita-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/pelita',
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
```

### 5. Start Application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure Nginx
Create `/etc/nginx/sites-available/pelita`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static/ {
        alias /var/www/pelita/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /var/www/pelita/public/;
        expires 1m;
        add_header Cache-Control "public";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/pelita /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🔄 Maintenance

### Daily Tasks

#### 1. Check Application Status
```bash
pm2 status
pm2 logs pelita-app --lines 50
```

#### 2. Monitor System Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top -n 1

# Check active connections
ss -tuln
```

### Weekly Tasks

#### 1. Update System Packages
```bash
sudo apt update && sudo apt list --upgradable
sudo apt upgrade -y
```

#### 2. Clean PM2 Logs
```bash
pm2 flush pelita-app
```

#### 3. Check SSL Certificate Status
```bash
sudo certbot certificates
```

### Monthly Tasks

#### 1. Update Node.js Dependencies
```bash
cd /var/www/pelita
npm outdated
npm update
npm audit
npm audit fix
```

#### 2. Restart Application
```bash
pm2 restart pelita-app
```

#### 3. Clean System Logs
```bash
sudo journalctl --vacuum-time=30d
```

### Quarterly Tasks

#### 1. Update Node.js Version
```bash
# Check current version
node --version

# Update to latest LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Rebuild application
cd /var/www/pelita
npm run build
pm2 restart pelita-app
```

## 📊 Monitoring

### 1. Setup PM2 Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

### 2. Setup System Monitoring Script
Create `/home/user/monitor.sh`:
```bash
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

# Log system stats
echo "[$DATE] Status: $STATUS, CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}'), Memory: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')" >> $LOG_FILE
```

Add to crontab:
```bash
crontab -e
# Add this line:
*/5 * * * * /home/user/monitor.sh
```

### 3. Setup Nginx Access Logs Analysis
```bash
# Install GoAccess for log analysis
sudo apt install goaccess -y

# Analyze logs
sudo goaccess /var/log/nginx/access.log -c
```

## 💾 Backup & Recovery

### 1. Automated Backup Script
Create `/home/user/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/pelita"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/pelita_app_$DATE.tar.gz" -C /var/www pelita

# Backup Nginx configuration
tar -czf "$BACKUP_DIR/nginx_config_$DATE.tar.gz" /etc/nginx/sites-available/pelita

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
```

### 2. Recovery Process
```bash
# Stop application
pm2 stop pelita-app

# Restore from backup
cd /var/www
sudo rm -rf pelita
sudo tar -xzf /backups/pelita_app_YYYYMMDD_HHMMSS.tar.gz

# Set permissions
sudo chown -R $USER:$USER pelita

# Restart application
cd pelita
npm install --production
npm run build
pm2 start ecosystem.config.js
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Application Not Starting
```bash
# Check PM2 status
pm2 status
pm2 logs pelita-app --lines 100

# Check if port is available
sudo netstat -tulpn | grep :3000

# Restart application
pm2 restart pelita-app
```

#### 2. High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart application to free memory
pm2 restart pelita-app
```

#### 3. SSL Certificate Issues
```bash
# Test SSL certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew
```

#### 4. Nginx Issues
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx
```

### Performance Optimization

#### 1. Enable Gzip Compression
Add to nginx configuration:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

#### 2. Enable Caching Headers
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔒 Security

### 1. Regular Security Updates
```bash
# Setup automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

### 2. Firewall Configuration
```bash
# Check current rules
sudo ufw status

# Allow specific IPs only (optional)
sudo ufw allow from YOUR_IP_ADDRESS to any port 22
```

### 3. Fail2Ban Setup
```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure fail2ban for nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

### 4. Regular Security Checks
```bash
# Check for rootkits
sudo apt install rkhunter -y
sudo rkhunter --check

# Check open ports
sudo nmap -sT -O localhost
```

## 📞 Support & Contacts

### Emergency Procedures
1. **Application Down**: Run `pm2 restart pelita-app`
2. **High Load**: Check `pm2 monit` and restart if needed
3. **SSL Expired**: Run `sudo certbot renew`
4. **Disk Full**: Clean logs and old backups

### Log Locations
- **Application Logs**: `~/.pm2/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `/var/log/syslog`
- **Backup Logs**: `/var/log/backup.log`

### Quick Commands Reference
```bash
# PM2 Management
pm2 status                  # Check app status
pm2 restart pelita-app     # Restart app
pm2 logs pelita-app        # View logs
pm2 monit                  # Monitoring dashboard

# System Monitoring
htop                       # System resources
df -h                      # Disk usage
free -h                    # Memory usage
sudo systemctl status nginx # Nginx status

# Maintenance
sudo systemctl reload nginx # Reload nginx
sudo certbot renew        # Renew SSL
npm run build             # Rebuild app
```

---

**Dokumen ini harus diperbarui setiap kali ada perubahan pada infrastruktur atau prosedur deployment.**

**Terakhir diperbarui**: $(date)
**Versi**: 1.0
**Penulis**: Tim PELITA