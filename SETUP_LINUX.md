# TarkovTracker - Linux Setup Guide

Simple plug-and-serve setup. Single port, no Docker required.

---

## Prerequisites

- **Linux** (Ubuntu 20.04+, Debian 11+, CentOS 8+, Oracle Linux 8+)
- **Node.js 20+**
- **Git**

---

## Quick Setup

### Step 1: Install Node.js

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
```

**CentOS/RHEL/Oracle Linux:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs git
```

Verify:
```bash
node --version  # Should show v22.x.x
```

### Step 2: Get the Code

```bash
cd /opt
sudo git clone https://github.com/MischieS/tarkovtracker.git
sudo chown -R $USER:$USER /opt/tarkovtracker
cd /opt/tarkovtracker
```

### Step 3: Install & Run

```bash
npm install
npm run serve
```

**Done!** Open http://localhost:3000

---

## Configuration (Optional)

```bash
cp .env.example .env
nano .env
```

```env
# Server port (default: 3000)
PORT=3000

# JWT Secret - CHANGE THIS!
JWT_SECRET=your-super-secret-key-here

# Custom data directory (optional)
# DATA_DIR=/var/lib/tarkovtracker
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

---

## Firewall Setup

### Ubuntu/Debian (UFW)

```bash
sudo ufw allow 3000/tcp
sudo ufw enable
sudo ufw status
```

### CentOS/RHEL/Oracle Linux (firewalld)

```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

### Verify Port is Open

```bash
# Check if server is listening
ss -tlnp | grep 3000

# Test locally
curl http://localhost:3000/api/health
```

---

## Run as Systemd Service

Create service file:
```bash
sudo nano /etc/systemd/system/tarkovtracker.service
```

Add:
```ini
[Unit]
Description=TarkovTracker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/tarkovtracker/server
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=JWT_SECRET=your-secret-here

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
# Fix permissions
sudo chown -R www-data:www-data /opt/tarkovtracker/server/data

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable tarkovtracker
sudo systemctl start tarkovtracker
sudo systemctl status tarkovtracker
```

Manage:
```bash
sudo systemctl stop tarkovtracker
sudo systemctl restart tarkovtracker
sudo journalctl -u tarkovtracker -f  # View logs
```

---

## Reverse Proxy with Nginx (Optional)

If you want to serve on port 80 or add SSL:

```bash
sudo apt install nginx -y  # Ubuntu/Debian
sudo dnf install nginx -y  # CentOS/RHEL
```

Create config:
```bash
sudo nano /etc/nginx/sites-available/tarkovtracker
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or your IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/tarkovtracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# CentOS/RHEL
sudo cp /etc/nginx/sites-available/tarkovtracker /etc/nginx/conf.d/tarkovtracker.conf

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y  # Ubuntu/Debian
sudo dnf install certbot python3-certbot-nginx -y  # CentOS/RHEL

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## Development Mode

```bash
npm run dev
```

- Frontend: http://localhost:5173 (hot reload)
- Backend: http://localhost:3000

---

## Updating

```bash
cd /opt/tarkovtracker
git pull
npm install
npm run build
sudo systemctl restart tarkovtracker
```

---

## Backup

Data is stored in `server/data/tarkovtracker.json`

```bash
# Manual backup
cp /opt/tarkovtracker/server/data/tarkovtracker.json ~/backups/

# Automated daily backup (cron)
crontab -e
# Add: 0 2 * * * cp /opt/tarkovtracker/server/data/tarkovtracker.json /opt/backups/tarkovtracker-$(date +\%Y\%m\%d).json
```

---

## Troubleshooting

### SELinux Issues (CentOS/RHEL)

```bash
# Check if SELinux is blocking
sudo ausearch -m avc -ts recent

# Allow Node.js network access
sudo setsebool -P httpd_can_network_connect 1
```

### Permission Issues

```bash
sudo chown -R $USER:$USER /opt/tarkovtracker
# Or for service:
sudo chown -R www-data:www-data /opt/tarkovtracker/server/data
```

### Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000
sudo ss -tlnp | grep 3000

# Kill process
sudo kill -9 <PID>
```

### Check Logs

```bash
# If running as service
sudo journalctl -u tarkovtracker -f

# If running manually, logs appear in terminal
```
