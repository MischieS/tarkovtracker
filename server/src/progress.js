import db, { saveDb } from './database.js';

/**
 * Get user's task progress
 */
export function getTaskProgressForUser(userId) {
  return db.data.taskProgress[userId] || { tasks: {} };
}

/**
 * Update user's task progress
 */
export async function setTaskProgressForUser(userId, progress) {
  db.data.taskProgress[userId] = progress;
  await saveDb();
  return progress;
}

/**
 * Update a single task's completion status
 */
export function updateTaskCompletion(userId, taskId, completed, objectives = {}) {
  const current = getTaskProgressForUser(userId);
  
  if (!current.tasks) current.tasks = {};
  current.tasks[taskId] = {
    complete: completed,
    objectives: objectives,
    updatedAt: new Date().toISOString()
  };
  
  return setTaskProgressForUser(userId, current);
}

/**
 * Update a single objective's completion status
 */
export function updateObjectiveCompletion(userId, taskId, objectiveId, completed, count = null) {
  const current = getTaskProgressForUser(userId);
  
  if (!current.tasks) current.tasks = {};
  if (!current.tasks[taskId]) current.tasks[taskId] = { complete: false, objectives: {} };
  if (!current.tasks[taskId].objectives) current.tasks[taskId].objectives = {};
  
  current.tasks[taskId].objectives[objectiveId] = {
    complete: completed,
    count: count,
    updatedAt: new Date().toISOString()
  };
  
  return setTaskProgressForUser(userId, current);
}

/**
 * Get user's hideout progress
 */
export function getHideoutProgressForUser(userId) {
  return db.data.hideoutProgress[userId] || { modules: {} };
}

/**
 * Update user's hideout progress
 */
export async function setHideoutProgressForUser(userId, progress) {
  db.data.hideoutProgress[userId] = progress;
  await saveDb();
  return progress;
}

/**
 * Update a single hideout module's completion status
 */
export async function updateHideoutModule(userId, moduleId, completed) {
  const current = getHideoutProgressForUser(userId);
  
  if (!current.modules) current.modules = {};
  current.modules[moduleId] = {
    complete: completed,
    updatedAt: new Date().toISOString()
  };
  
  return await setHideoutProgressForUser(userId, current);
}

/**
 * Get user settings
 */
export function getSettingsForUser(userId) {
  return db.data.userSettings[userId] || {};
}

/**
 * Update user settings
 */
export async function setSettingsForUser(userId, settings) {
  db.data.userSettings[userId] = settings;
  await saveDb();
  return settings;
}

/**
 * Get complete user data (for initial load)
 */
export function getAllUserData(userId) {
  return {
    tasks: getTaskProgressForUser(userId),
    hideout: getHideoutProgressForUser(userId),
    settings: getSettingsForUser(userId)
  };
}

/**
 * Reset all progress for a user
 */
export async function resetProgress(userId) {
  await setTaskProgressForUser(userId, { tasks: {} });
  await setHideoutProgressForUser(userId, { modules: {} });
  return { tasks: {}, hideout: {} };
}
