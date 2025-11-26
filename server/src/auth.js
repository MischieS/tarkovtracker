import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db, { saveDb } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tarkovtracker-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Register a new user
 */
export async function register(username, password, displayName) {
  // Validate input
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters');
  }

  // Check if username exists
  const existing = db.data.users.find(u => u.username === username.toLowerCase());
  if (existing) {
    throw new Error('Username already taken');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const userId = uuidv4();
  const user = {
    id: userId,
    username: username.toLowerCase(),
    passwordHash,
    displayName: displayName || username,
    createdAt: new Date().toISOString()
  };
  
  db.data.users.push(user);
  
  // Initialize empty progress records
  db.data.taskProgress[userId] = { tasks: {} };
  db.data.hideoutProgress[userId] = { modules: {} };
  db.data.userSettings[userId] = {};
  
  await saveDb();

  // Generate token
  const token = jwt.sign({ userId, username: username.toLowerCase() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: userId,
      username: username.toLowerCase(),
      displayName: displayName || username
    }
  };
}

/**
 * Login user
 */
export async function login(username, password) {
  const user = db.data.users.find(u => u.username === username.toLowerCase());
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid username or password');
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName
    }
  };
}

/**
 * Verify JWT token middleware
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Get user profile
 */
export function getProfile(userId) {
  const user = db.data.users.find(u => u.id === userId);
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    display_name: user.displayName,
    created_at: user.createdAt
  };
}

/**
 * Update user profile
 */
export async function updateProfile(userId, displayName) {
  const user = db.data.users.find(u => u.id === userId);
  if (user) {
    user.displayName = displayName;
    await saveDb();
  }
  return getProfile(userId);
}

export { JWT_SECRET };
