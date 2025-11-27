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

## That's it!

Your data is stored in `server/data/tarkovtracker.json`.
