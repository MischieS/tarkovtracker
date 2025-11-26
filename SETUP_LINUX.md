# TarkovTracker - Linux Server Setup Guide

This guide covers deploying TarkovTracker on Linux (Ubuntu/Debian, CentOS/RHEL, or Oracle Linux).

---

## Prerequisites

- **Linux Server** (Ubuntu 20.04+, Debian 11+, CentOS 8+, Oracle Linux 8+)
- **Root or sudo access**
- **Minimum 1GB RAM**, 10GB disk space

---

## Option 1: Docker (Recommended)

### Step 1: Install Docker

**Ubuntu/Debian:**
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Log out and back in, then verify
docker --version
docker compose version
```

**CentOS/RHEL/Oracle Linux:**
```bash
# Install Docker
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
```

### Step 2: Clone the Project

```bash
# Install git if needed
sudo apt install git -y  # Ubuntu/Debian
sudo dnf install git -y  # CentOS/RHEL

# Clone the repository
cd /opt
sudo git clone <your-repo-url> tarkovtracker
sudo chown -R $USER:$USER /opt/tarkovtracker
cd /opt/tarkovtracker
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT_SECRET: $JWT_SECRET"

# Edit the configuration
nano .env
```

Update `.env`:
```env
JWT_SECRET=<paste-generated-secret>
API_URL=http://YOUR_SERVER_IP:3001
```

### Step 4: Build and Run

```bash
# Build containers
docker compose build

# Start services in background
docker compose up -d

# Check status
docker compose ps
```

### Step 5: Configure Firewall

**Ubuntu/Debian (UFW):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
sudo ufw status
```

**CentOS/RHEL/Oracle Linux (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

### Step 6: Verify Installation

```bash
# Check container status
docker compose ps

# Test API health
curl http://localhost:3001/api/health

# Test frontend
curl -I http://localhost
```

Access in browser:
- Frontend: `http://YOUR_SERVER_IP`
- API: `http://YOUR_SERVER_IP:3001/api/health`

---

## Option 2: Native Node.js Installation

### Step 1: Install Node.js 20+

**Using NodeSource (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

**Using NodeSource (CentOS/RHEL):**
```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

Verify installation:
```bash
node --version  # Should show v22.x.x
npm --version
```

### Step 2: Clone the Project

```bash
cd /opt
sudo git clone <your-repo-url> tarkovtracker
sudo chown -R $USER:$USER /opt/tarkovtracker
cd /opt/tarkovtracker
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

```bash
cp .env.example .env
nano .env
```

Update `.env`:
```env
JWT_SECRET=$(openssl rand -base64 32)
API_URL=http://YOUR_SERVER_IP:3001
```

### Step 5: Build Frontend

```bash
npm run build
```

### Step 6: Install Nginx (for Frontend)

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo dnf install nginx -y
sudo systemctl enable nginx
```

Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/tarkovtracker
```

Add configuration:
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    root /opt/tarkovtracker/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/tarkovtracker /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# CentOS/RHEL (copy to conf.d instead)
sudo cp /etc/nginx/sites-available/tarkovtracker /etc/nginx/conf.d/tarkovtracker.conf

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Create Systemd Service for API

```bash
sudo nano /etc/systemd/system/tarkovtracker-api.service
```

Add:
```ini
[Unit]
Description=TarkovTracker API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/tarkovtracker/server
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=JWT_SECRET=your-secret-here
Environment=DB_PATH=/opt/tarkovtracker/server/data/tarkovtracker.db

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tarkovtracker-api
sudo systemctl start tarkovtracker-api
sudo systemctl status tarkovtracker-api
```

---

## Managing the Application

### Docker Commands

```bash
# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f api
docker compose logs -f frontend

# Restart services
docker compose restart

# Stop services
docker compose down

# Update and rebuild
cd /opt/tarkovtracker
git pull
docker compose build --no-cache
docker compose up -d
```

### Systemd Commands (Native Install)

```bash
# Check status
sudo systemctl status tarkovtracker-api
sudo systemctl status nginx

# Restart services
sudo systemctl restart tarkovtracker-api
sudo systemctl restart nginx

# View logs
sudo journalctl -u tarkovtracker-api -f
```

---

## Backup and Restore

### Docker Volume Backup

```bash
# Create backup directory
mkdir -p /opt/backups

# Backup database
docker run --rm \
  -v tarkovtracker_api-data:/data \
  -v /opt/backups:/backup \
  alpine tar czf /backup/tarkovtracker-$(date +%Y%m%d).tar.gz -C /data .

# Restore from backup
docker compose down
docker run --rm \
  -v tarkovtracker_api-data:/data \
  -v /opt/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/tarkovtracker-YYYYMMDD.tar.gz -C /data"
docker compose up -d
```

### Native Installation Backup

```bash
# Backup
cp /opt/tarkovtracker/server/data/tarkovtracker.db /opt/backups/tarkovtracker-$(date +%Y%m%d).db

# Restore
sudo systemctl stop tarkovtracker-api
cp /opt/backups/tarkovtracker-YYYYMMDD.db /opt/tarkovtracker/server/data/tarkovtracker.db
sudo systemctl start tarkovtracker-api
```

### Automated Backup (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker run --rm -v tarkovtracker_api-data:/data -v /opt/backups:/backup alpine tar czf /backup/tarkovtracker-$(date +\%Y\%m\%d).tar.gz -C /data .
```

---

## SSL/HTTPS Setup (Recommended for Production)

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y  # Ubuntu/Debian
sudo dnf install certbot python3-certbot-nginx -y  # CentOS/RHEL

# Obtain certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Check if services are running
```bash
# Docker
docker compose ps
docker compose logs

# Native
sudo systemctl status tarkovtracker-api
sudo systemctl status nginx
```

### Port conflicts
```bash
# Check what's using a port
sudo lsof -i :80
sudo lsof -i :3001
sudo netstat -tlnp | grep -E '80|3001'
```

### Permission issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/tarkovtracker

# For native install with www-data user
sudo chown -R www-data:www-data /opt/tarkovtracker/server/data
```

### SELinux issues (CentOS/RHEL)
```bash
# Check SELinux status
getenforce

# Allow nginx to connect to network
sudo setsebool -P httpd_can_network_connect 1

# Or set permissive mode (less secure)
sudo setenforce 0
```

### Container won't start
```bash
# Check logs
docker compose logs api
docker compose logs frontend

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## Security Recommendations

1. **Use strong JWT_SECRET** - Generate with `openssl rand -base64 32`
2. **Enable HTTPS** - Use Let's Encrypt for free SSL certificates
3. **Keep system updated** - `sudo apt update && sudo apt upgrade -y`
4. **Configure firewall** - Only open necessary ports
5. **Regular backups** - Automate with cron jobs
6. **Monitor logs** - Check for suspicious activity
7. **Restrict SSH** - Use key-based authentication, disable root login
