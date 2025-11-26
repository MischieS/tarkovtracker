import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = process.env.DATA_DIR || join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

// Default database structure
const defaultData = {
  users: [],
  teams: [],
  teamMembers: [],
  taskProgress: {},
  hideoutProgress: {},
  userSettings: {}
};

// Initialize lowdb with JSON file
const dbPath = join(dataDir, 'tarkovtracker.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// Read data from JSON file
await db.read();

// Initialize with defaults if empty
if (!db.data) {
  db.data = defaultData;
  await db.write();
}

// Helper to save changes
export async function saveDb() {
  await db.write();
}

export default db;
