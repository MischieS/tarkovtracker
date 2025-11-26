import db, { saveDb } from './database.js';
import { v4 as uuidv4 } from 'uuid';
import { getTaskProgressForUser, getHideoutProgressForUser } from './progress.js';

/**
 * Create a new team
 */
export async function createTeam(ownerId, name) {
  const teamId = uuidv4().substring(0, 8); // Short team ID for easy sharing
  
  const team = {
    id: teamId,
    name,
    ownerId,
    createdAt: new Date().toISOString()
  };
  
  db.data.teams.push(team);
  db.data.teamMembers.push({
    teamId,
    userId: ownerId,
    joinedAt: new Date().toISOString()
  });
  
  await saveDb();
  
  return getTeamWithMembers(teamId);
}

/**
 * Join a team by ID
 */
export async function joinTeam(userId, teamId) {
  const team = db.data.teams.find(t => t.id === teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Check if already a member
  const isMember = db.data.teamMembers.some(m => m.teamId === teamId && m.userId === userId);
  if (isMember) {
    throw new Error('Already a member of this team');
  }
  
  db.data.teamMembers.push({
    teamId,
    userId,
    joinedAt: new Date().toISOString()
  });
  
  await saveDb();
  return getTeamWithMembers(teamId);
}

/**
 * Leave a team
 */
export async function leaveTeam(userId, teamId) {
  const team = db.data.teams.find(t => t.id === teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  // If owner leaves, delete the team
  if (team.ownerId === userId) {
    db.data.teams = db.data.teams.filter(t => t.id !== teamId);
    db.data.teamMembers = db.data.teamMembers.filter(m => m.teamId !== teamId);
    await saveDb();
    return { deleted: true };
  }
  
  db.data.teamMembers = db.data.teamMembers.filter(m => !(m.teamId === teamId && m.userId === userId));
  await saveDb();
  return { left: true };
}

/**
 * Get team with members
 */
export function getTeamWithMembers(teamId) {
  const team = db.data.teams.find(t => t.id === teamId);
  if (!team) return null;
  
  const memberData = db.data.teamMembers
    .filter(m => m.teamId === teamId)
    .map(m => ({ userId: m.userId, joinedAt: m.joinedAt }));
  
  const members = memberData.map(m => {
    const user = db.data.users.find(u => u.id === m.userId);
    return {
      id: user?.id,
      username: user?.username,
      displayName: user?.displayName,
      joinedAt: m.joinedAt
    };
  }).filter(m => m.id);
  
  return {
    id: team.id,
    name: team.name,
    ownerId: team.ownerId,
    createdAt: team.createdAt,
    members
  };
}

/**
 * Get all teams for a user
 */
export function getTeamsForUser(userId) {
  const teamIds = db.data.teamMembers
    .filter(m => m.userId === userId)
    .map(m => m.teamId);
  return teamIds.map(id => getTeamWithMembers(id)).filter(t => t);
}

/**
 * Get team progress (all members' progress)
 */
export function getTeamProgress(teamId) {
  const team = db.data.teams.find(t => t.id === teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  const memberIds = db.data.teamMembers
    .filter(m => m.teamId === teamId)
    .map(m => m.userId);
  
  return memberIds.map(userId => {
    const user = db.data.users.find(u => u.id === userId);
    return {
      id: userId,
      username: user?.username,
      displayName: user?.displayName,
      tasks: getTaskProgressForUser(userId),
      hideout: getHideoutProgressForUser(userId)
    };
  });
}

/**
 * Rename team (owner only)
 */
export async function renameTeam(userId, teamId, newName) {
  const team = db.data.teams.find(t => t.id === teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.ownerId !== userId) {
    throw new Error('Only the team owner can rename the team');
  }
  
  team.name = newName;
  await saveDb();
  return getTeamWithMembers(teamId);
}

/**
 * Kick member (owner only)
 */
export async function kickMember(ownerId, teamId, memberId) {
  const team = db.data.teams.find(t => t.id === teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.ownerId !== ownerId) {
    throw new Error('Only the team owner can kick members');
  }
  if (ownerId === memberId) {
    throw new Error('Cannot kick yourself');
  }
  
  db.data.teamMembers = db.data.teamMembers.filter(m => !(m.teamId === teamId && m.userId === memberId));
  await saveDb();
  return getTeamWithMembers(teamId);
}
