# TarkovTracker Quick Start

Single-port, plug-and-serve setup. No Docker required.

## Requirements

- Node.js 20+
- npm

## Quick Setup (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Start server
npm start
```

Then open http://localhost:3000

## One-liner

```bash
npm install && npm run serve
```

## Development Mode

For development with hot-reload:

```bash
npm run dev
```

This starts:
- Frontend dev server at http://localhost:5173 (with hot reload)
- Backend API at http://localhost:3000

## Configuration (Optional)

Create a `.env` file in the root directory:

```env
# Server port (default: 3000)
PORT=3000

# JWT Secret - change this for security!
JWT_SECRET=your-secret-key-here

# Custom data directory (default: server/data)
# DATA_DIR=/path/to/data
```

## Network Access

To access from other devices, open port 3000 in your firewall:

**Windows (PowerShell as Admin):**
```powershell
New-NetFirewallRule -DisplayName "TarkovTracker" -Direction Inbound -Port 3000 -Protocol TCP -Action Allow
```

**Linux (UFW):**
```bash
sudo ufw allow 3000/tcp
```

**Linux (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp && sudo firewall-cmd --reload
```

Then access via `http://YOUR_IP:3000`

## That's it!

Your data is stored in `server/data/tarkovtracker.json`.

For detailed setup guides, see:
- [SETUP_WINDOWS.md](SETUP_WINDOWS.md)
- [SETUP_LINUX.md](SETUP_LINUX.md)
