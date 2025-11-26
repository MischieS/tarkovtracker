# TarkovTracker - Windows Server Setup Guide

This guide covers deploying TarkovTracker on a Windows Server.

---

## Prerequisites

- **Windows Server 2019/2022** or Windows 10/11
- **Administrator access**
- **Minimum 2GB RAM**, 10GB disk space

---

## Option 1: Docker Desktop (Recommended)

### Step 1: Install Docker Desktop

1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Run the installer and follow prompts
3. Restart your computer when prompted
4. Launch Docker Desktop and wait for it to start

### Step 2: Install Git (Optional)

Download and install Git from [git-scm.com](https://git-scm.com/download/win)

### Step 3: Clone or Copy the Project

```powershell
# Using Git
git clone <your-repo-url> C:\TarkovTracker
cd C:\TarkovTracker

# Or copy files manually to C:\TarkovTracker
```

### Step 4: Configure Environment

```powershell
# Copy the example environment file
copy .env.example .env

# Edit .env with notepad or your preferred editor
notepad .env
```

Update the `.env` file:
```env
# Generate a secure secret (use PowerShell)
# [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
JWT_SECRET=your-generated-secret-here

# Set your server's IP or domain
API_URL=http://YOUR_SERVER_IP:3001
```

### Step 5: Build and Run

```powershell
# Build the containers
docker-compose build

# Start the services
docker-compose up -d

# Check status
docker-compose ps
```

### Step 6: Configure Windows Firewall

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "TarkovTracker HTTP" -Direction Inbound -Port 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "TarkovTracker API" -Direction Inbound -Port 3001 -Protocol TCP -Action Allow
```

### Step 7: Verify Installation

- Frontend: `http://localhost` or `http://YOUR_SERVER_IP`
- API Health: `http://localhost:3001/api/health`

---

## Option 2: Native Node.js Installation

### Step 1: Install Node.js

1. Download Node.js 20+ LTS from [nodejs.org](https://nodejs.org/)
2. Run the installer with default options
3. Verify installation:
   ```powershell
   node --version  # Should show v20.x.x or higher
   npm --version
   ```

### Step 2: Clone or Copy the Project

```powershell
cd C:\
git clone <your-repo-url> TarkovTracker
cd TarkovTracker
```

### Step 3: Install Dependencies

```powershell
npm install
```

### Step 4: Configure Environment

```powershell
copy .env.example .env
notepad .env
```

Update `.env`:
```env
JWT_SECRET=your-secure-secret-here
API_URL=http://YOUR_SERVER_IP:3001
```

### Step 5: Build Frontend

```powershell
npm run build
```

### Step 6: Install and Configure IIS (for Frontend)

1. Open **Server Manager** → **Add Roles and Features**
2. Select **Web Server (IIS)**
3. Install with default features

Configure IIS:
1. Open **IIS Manager**
2. Create a new website pointing to `C:\TarkovTracker\frontend\dist`
3. Set binding to port 80

### Step 7: Run the API Server

```powershell
cd C:\TarkovTracker
npm run start
```

### Step 8: Create Windows Service (Optional)

Install [NSSM](https://nssm.cc/) to run the API as a service:

```powershell
# Download NSSM and add to PATH, then:
nssm install TarkovTrackerAPI "C:\Program Files\nodejs\node.exe" "C:\TarkovTracker\server\src\index.js"
nssm set TarkovTrackerAPI AppDirectory "C:\TarkovTracker\server"
nssm start TarkovTrackerAPI
```

---

## Managing the Application

### Docker Commands

```powershell
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update and rebuild
git pull
docker-compose build --no-cache
docker-compose up -d
```

### Backup Data

```powershell
# Docker volume backup
docker run --rm -v tarkovtracker_api-data:/data -v C:\Backups:/backup alpine tar czf /backup/tarkovtracker-backup.tar.gz -C /data .

# Native installation
copy C:\TarkovTracker\server\data\tarkovtracker.db C:\Backups\
```

---

## Troubleshooting

### Docker won't start
- Ensure Hyper-V and WSL2 are enabled
- Run: `wsl --update`

### Port already in use
```powershell
netstat -ano | findstr :80
netstat -ano | findstr :3001
# Kill process: taskkill /PID <PID> /F
```

### Check Docker logs
```powershell
docker-compose logs api
docker-compose logs frontend
```

### Firewall issues
Ensure Windows Firewall rules are created (see Step 6 in Docker setup).

---

## Security Recommendations

1. **Change the JWT_SECRET** to a strong, random value
2. **Use HTTPS** in production with a reverse proxy (nginx, IIS with SSL)
3. **Keep Windows updated** with security patches
4. **Restrict firewall rules** to specific IP ranges if possible
5. **Regular backups** of the database volume
