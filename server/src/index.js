import express from 'express';
import cors from 'cors';
import { register, login, authMiddleware, getProfile, updateProfile } from './auth.js';
import {
  getTaskProgressForUser,
  setTaskProgressForUser,
  updateTaskCompletion,
  updateObjectiveCompletion,
  getHideoutProgressForUser,
  setHideoutProgressForUser,
  updateHideoutModule,
  getSettingsForUser,
  setSettingsForUser,
  getAllUserData,
  resetProgress
} from './progress.js';
import {
  createTeam,
  joinTeam,
  leaveTeam,
  getTeamWithMembers,
  getTeamsForUser,
  getTeamProgress,
  renameTeam,
  kickMember
} from './teams.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    const result = await register(username, password, displayName);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await login(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const profile = getProfile(req.user.userId);
  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(profile);
});

app.put('/api/auth/profile', authMiddleware, (req, res) => {
  try {
    const { displayName } = req.body;
    const profile = updateProfile(req.user.userId, displayName);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============ PROGRESS ROUTES ============

// Get all user data (tasks, hideout, settings)
app.get('/api/progress', authMiddleware, (req, res) => {
  const data = getAllUserData(req.user.userId);
  res.json(data);
});

// Get task progress
app.get('/api/progress/tasks', authMiddleware, (req, res) => {
  const progress = getTaskProgressForUser(req.user.userId);
  res.json(progress);
});

// Update all task progress
app.put('/api/progress/tasks', authMiddleware, (req, res) => {
  const progress = setTaskProgressForUser(req.user.userId, req.body);
  res.json(progress);
});

// Update single task
app.put('/api/progress/tasks/:taskId', authMiddleware, (req, res) => {
  const { completed, objectives } = req.body;
  const progress = updateTaskCompletion(req.user.userId, req.params.taskId, completed, objectives);
  res.json(progress);
});

// Update single objective
app.put('/api/progress/tasks/:taskId/objectives/:objectiveId', authMiddleware, (req, res) => {
  const { completed, count } = req.body;
  const progress = updateObjectiveCompletion(
    req.user.userId,
    req.params.taskId,
    req.params.objectiveId,
    completed,
    count
  );
  res.json(progress);
});

// Get hideout progress
app.get('/api/progress/hideout', authMiddleware, (req, res) => {
  const progress = getHideoutProgressForUser(req.user.userId);
  res.json(progress);
});

// Update all hideout progress
app.put('/api/progress/hideout', authMiddleware, (req, res) => {
  const progress = setHideoutProgressForUser(req.user.userId, req.body);
  res.json(progress);
});

// Update single hideout module
app.put('/api/progress/hideout/:moduleId', authMiddleware, (req, res) => {
  const { completed } = req.body;
  const progress = updateHideoutModule(req.user.userId, req.params.moduleId, completed);
  res.json(progress);
});

// Get user settings
app.get('/api/settings', authMiddleware, (req, res) => {
  const settings = getSettingsForUser(req.user.userId);
  res.json(settings);
});

// Update user settings
app.put('/api/settings', authMiddleware, (req, res) => {
  const settings = setSettingsForUser(req.user.userId, req.body);
  res.json(settings);
});

// Reset all progress
app.post('/api/progress/reset', authMiddleware, (req, res) => {
  const result = resetProgress(req.user.userId);
  res.json(result);
});

// ============ TEAM ROUTES ============

// Get user's teams
app.get('/api/teams', authMiddleware, (req, res) => {
  const teams = getTeamsForUser(req.user.userId);
  res.json(teams);
});

// Create team
app.post('/api/teams', authMiddleware, (req, res) => {
  try {
    const { name } = req.body;
    const team = createTeam(req.user.userId, name || 'My Team');
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get team by ID
app.get('/api/teams/:teamId', authMiddleware, (req, res) => {
  const team = getTeamWithMembers(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  res.json(team);
});

// Join team
app.post('/api/teams/:teamId/join', authMiddleware, (req, res) => {
  try {
    const team = joinTeam(req.user.userId, req.params.teamId);
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Leave team
app.post('/api/teams/:teamId/leave', authMiddleware, (req, res) => {
  try {
    const result = leaveTeam(req.user.userId, req.params.teamId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get team progress (all members)
app.get('/api/teams/:teamId/progress', authMiddleware, (req, res) => {
  try {
    const progress = getTeamProgress(req.params.teamId);
    res.json(progress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rename team (owner only)
app.put('/api/teams/:teamId', authMiddleware, (req, res) => {
  try {
    const { name } = req.body;
    const team = renameTeam(req.user.userId, req.params.teamId, name);
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Kick member (owner only)
app.delete('/api/teams/:teamId/members/:memberId', authMiddleware, (req, res) => {
  try {
    const team = kickMember(req.user.userId, req.params.teamId, req.params.memberId);
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 TarkovTracker API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
