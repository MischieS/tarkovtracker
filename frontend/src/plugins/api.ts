import { reactive, ref, computed } from 'vue';

// API base URL - empty string means same origin (single-port setup)
const API_BASE = import.meta.env.VITE_API_URL || '';

// Token storage
const TOKEN_KEY = 'tarkovtracker_token';

// Reactive user state (replaces fireuser)
interface User {
  id: string | null;
  username: string | null;
  displayName: string | null;
  loggedIn: boolean;
}

export const currentUser = reactive<User>({
  id: null,
  username: null,
  displayName: null,
  loggedIn: false,
});

// Loading state
export const authLoading = ref(true);

// Get stored token
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Set token
function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============ AUTH API ============

export async function register(username: string, password: string, displayName?: string) {
  const result = await apiRequest<{ token: string; user: { id: string; username: string; displayName: string } }>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName }),
    }
  );

  setToken(result.token);
  Object.assign(currentUser, {
    id: result.user.id,
    username: result.user.username,
    displayName: result.user.displayName,
    loggedIn: true,
  });

  return result;
}

export async function login(username: string, password: string) {
  const result = await apiRequest<{ token: string; user: { id: string; username: string; displayName: string } }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }
  );

  setToken(result.token);
  Object.assign(currentUser, {
    id: result.user.id,
    username: result.user.username,
    displayName: result.user.displayName,
    loggedIn: true,
  });

  return result;
}

export function logout() {
  setToken(null);
  Object.assign(currentUser, {
    id: null,
    username: null,
    displayName: null,
    loggedIn: false,
  });
}

export async function checkAuth() {
  const token = getToken();
  if (!token) {
    authLoading.value = false;
    return false;
  }

  try {
    const user = await apiRequest<{ id: string; username: string; display_name: string }>('/api/auth/me');
    Object.assign(currentUser, {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      loggedIn: true,
    });
    authLoading.value = false;
    return true;
  } catch {
    setToken(null);
    authLoading.value = false;
    return false;
  }
}

export async function updateProfile(displayName: string) {
  const user = await apiRequest<{ id: string; username: string; display_name: string }>(
    '/api/auth/profile',
    {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    }
  );
  currentUser.displayName = user.display_name;
  return user;
}

// ============ PROGRESS API ============

export interface TaskProgressData {
  tasks?: Record<string, {
    complete: boolean;
    objectives?: Record<string, { complete: boolean; count?: number }>;
    updatedAt?: string;
  }>;
}

export interface HideoutProgressData {
  modules?: Record<string, {
    complete: boolean;
    updatedAt?: string;
  }>;
}

export interface UserProgressData {
  tasks: TaskProgressData;
  hideout: HideoutProgressData;
  settings: Record<string, unknown>;
}

export async function getAllProgress(): Promise<UserProgressData> {
  return apiRequest<UserProgressData>('/api/progress');
}

export async function getTaskProgress(): Promise<TaskProgressData> {
  return apiRequest<TaskProgressData>('/api/progress/tasks');
}

export async function setTaskProgress(progress: TaskProgressData): Promise<TaskProgressData> {
  return apiRequest<TaskProgressData>('/api/progress/tasks', {
    method: 'PUT',
    body: JSON.stringify(progress),
  });
}

export async function updateTask(taskId: string, completed: boolean, objectives?: Record<string, unknown>) {
  return apiRequest(`/api/progress/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ completed, objectives }),
  });
}

export async function updateObjective(taskId: string, objectiveId: string, completed: boolean, count?: number) {
  return apiRequest(`/api/progress/tasks/${taskId}/objectives/${objectiveId}`, {
    method: 'PUT',
    body: JSON.stringify({ completed, count }),
  });
}

export async function getHideoutProgress(): Promise<HideoutProgressData> {
  return apiRequest<HideoutProgressData>('/api/progress/hideout');
}

export async function setHideoutProgress(progress: HideoutProgressData): Promise<HideoutProgressData> {
  return apiRequest<HideoutProgressData>('/api/progress/hideout', {
    method: 'PUT',
    body: JSON.stringify(progress),
  });
}

export async function updateHideoutModule(moduleId: string, completed: boolean) {
  return apiRequest(`/api/progress/hideout/${moduleId}`, {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  });
}

export async function getSettings(): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/api/settings');
}

export async function setSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function resetProgress() {
  return apiRequest('/api/progress/reset', { method: 'POST' });
}

// ============ TEAM API ============

export interface TeamMember {
  id: string;
  username: string;
  displayName: string;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  members: TeamMember[];
}

export interface TeamMemberProgress {
  id: string;
  username: string;
  displayName: string;
  tasks: TaskProgressData;
  hideout: HideoutProgressData;
}

export async function getTeams(): Promise<Team[]> {
  return apiRequest<Team[]>('/api/teams');
}

export async function createTeam(name: string): Promise<Team> {
  return apiRequest<Team>('/api/teams', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getTeam(teamId: string): Promise<Team> {
  return apiRequest<Team>(`/api/teams/${teamId}`);
}

export async function joinTeam(teamId: string): Promise<Team> {
  return apiRequest<Team>(`/api/teams/${teamId}/join`, { method: 'POST' });
}

export async function leaveTeam(teamId: string) {
  return apiRequest(`/api/teams/${teamId}/leave`, { method: 'POST' });
}

export async function getTeamProgress(teamId: string): Promise<TeamMemberProgress[]> {
  return apiRequest<TeamMemberProgress[]>(`/api/teams/${teamId}/progress`);
}

export async function renameTeam(teamId: string, name: string): Promise<Team> {
  return apiRequest<Team>(`/api/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

export async function kickMember(teamId: string, memberId: string): Promise<Team> {
  return apiRequest<Team>(`/api/teams/${teamId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

// Initialize auth from localStorage (call this on app start)
export function initAuth() {
  checkAuth();
}
