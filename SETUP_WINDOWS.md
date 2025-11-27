# TarkovTracker - Windows Setup Guide

Simple plug-and-serve setup. Single port, no Docker required.

---

## Prerequisites

- **Windows 10/11** or Windows Server 2019/2022
- **Node.js 20+** - Download from [nodejs.org](https://nodejs.org/)
- **Git** (optional) - Download from [git-scm.com](https://git-scm.com/download/win)

---

## Quick Setup

### Step 1: Get the Code

```powershell
# Using Git
git clone https://github.com/MischieS/tarkovtracker.git C:\TarkovTracker
cd C:\TarkovTracker

# Or download and extract ZIP to C:\TarkovTracker
```

### Step 2: Install & Run

```powershell
# Install dependencies
npm install

# Build frontend and start server
npm run serve
```

**Done!** Open http://localhost:3000

---

## Configuration (Optional)

Create a `.env` file in the project root:

```powershell
copy .env.example .env
notepad .env
```

```env
# Server port (default: 3000)
PORT=3000

# JWT Secret - CHANGE THIS for security!
JWT_SECRET=your-super-secret-key-here

# Custom data directory (optional)
# DATA_DIR=C:\TarkovTracker\data
```

Generate a secure JWT secret in PowerShell:
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## Windows Firewall Setup

### Allow Port Through Firewall (Required for Network Access)

**Option 1: PowerShell (Run as Administrator)**

```powershell
# Allow port 3000 (or your custom port)
New-NetFirewallRule -DisplayName "TarkovTracker" -Direction Inbound -Port 3000 -Protocol TCP -Action Allow
```

**Option 2: Windows Firewall GUI**

1. Press `Win + R`, type `wf.msc`, press Enter
2. Click **Inbound Rules** → **New Rule...**
3. Select **Port** → Next
4. Select **TCP**, enter **3000** → Next
5. Select **Allow the connection** → Next
6. Check all profiles (Domain, Private, Public) → Next
7. Name it **TarkovTracker** → Finish

### Verify Firewall Rule

```powershell
# List firewall rules for TarkovTracker
Get-NetFirewallRule -DisplayName "*TarkovTracker*" | Format-Table Name, Enabled, Direction, Action

# Check if port is listening
netstat -an | findstr :3000
```

---

## Firewall Troubleshooting

### Problem: Can't access from other devices on network

**Check 1: Is the server running?**
```powershell
# Should show LISTENING on port 3000
netstat -an | findstr :3000
```

**Check 2: Is firewall rule active?**
```powershell
Get-NetFirewallRule -DisplayName "TarkovTracker" | Select-Object Enabled
# Should show: True
```

**Check 3: Test local access first**
```powershell
# This should work
curl http://localhost:3000/api/health
```

**Check 4: Find your local IP**
```powershell
ipconfig | findstr "IPv4"
# Use this IP from other devices: http://YOUR_IP:3000
```

**Check 5: Disable firewall temporarily (for testing only)**
```powershell
# Temporarily disable Windows Firewall (run as admin)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable after testing!
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### Problem: Port already in use

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in .env file
PORT=3001
```

### Problem: Antivirus blocking connections

Some antivirus software has its own firewall. Check:
- Windows Defender (usually fine)
- Norton, McAfee, Kaspersky, etc. - add exception for Node.js or port 3000

### Problem: Network profile is Public

Windows is more restrictive on Public networks:

```powershell
# Check network profile
Get-NetConnectionProfile

# Change to Private (more permissive)
Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
# Replace "Ethernet" with your adapter name
```

---

## Run as Windows Service

To run TarkovTracker automatically on startup:

### Option 1: Task Scheduler

1. Open **Task Scheduler** (`taskschd.msc`)
2. Click **Create Task...**
3. **General tab**: Name it "TarkovTracker", check "Run whether user is logged on or not"
4. **Triggers tab**: Add trigger → "At startup"
5. **Actions tab**: Add action:
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `C:\TarkovTracker\server\src\index.js`
   - Start in: `C:\TarkovTracker\server`
6. Click OK and enter your password

### Option 2: NSSM (Non-Sucking Service Manager)

1. Download [NSSM](https://nssm.cc/download)
2. Extract to `C:\nssm`
3. Run as Administrator:

```powershell
C:\nssm\win64\nssm.exe install TarkovTracker "C:\Program Files\nodejs\node.exe" "C:\TarkovTracker\server\src\index.js"
C:\nssm\win64\nssm.exe set TarkovTracker AppDirectory "C:\TarkovTracker\server"
C:\nssm\win64\nssm.exe start TarkovTracker
```

Manage the service:
```powershell
# Check status
sc query TarkovTracker

# Stop/Start
net stop TarkovTracker
net start TarkovTracker

# Remove service
C:\nssm\win64\nssm.exe remove TarkovTracker confirm
```

---

## Development Mode

For development with hot-reload:

```powershell
npm run dev
```

This starts:
- Frontend: http://localhost:5173 (with hot reload)
- Backend: http://localhost:3000

---

## Updating

```powershell
cd C:\TarkovTracker
git pull
npm install
npm run serve
```

---

## Backup

Your data is stored in `server\data\tarkovtracker.json`

```powershell
# Manual backup
copy C:\TarkovTracker\server\data\tarkovtracker.json C:\Backups\tarkovtracker-backup.json
```

---

## Troubleshooting

### Check if Node.js is installed
```powershell
node --version
# Should show v20.x.x or higher
```

### Check server logs
The server outputs logs to the console. If running as a service, check:
```powershell
# NSSM logs
C:\nssm\win64\nssm.exe status TarkovTracker
```

### Reset everything
```powershell
cd C:\TarkovTracker
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force frontend\dist
npm install
npm run serve
```
