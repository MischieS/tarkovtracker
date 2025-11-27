import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { currentUser, getTeams, getTeamProgress, type TeamMemberProgress } from '@/plugins/api';
import type { Store } from 'pinia';
import type { UserState, UserProgressData } from '@/shared_state';

interface TeamState {
  owner?: string | null;
  password?: string | null;
  members?: string[];
}

/**
 * Team store definition - simplified for local use
 */
export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    owner: null,
    password: null,
    members: [],
  }),
  getters: {
    teamOwner(state) {
      return state?.owner || null;
    },
    isOwner(state) {
      const owner = state.owner;
      return owner === currentUser.id;
    },
    teamPassword(state) {
      return state?.password || null;
    },
    teamMembers(state) {
      return state?.members || [];
    },
    teammates(state) {
      const currentMembers = state?.members;
      const currentUserId = currentUser?.id;

      if (currentMembers && currentUserId) {
        return currentMembers.filter((member) => member !== currentUserId);
      }

      return [];
    },
  },
});

// Store for team member progress data
const teamMemberProgress = ref<Record<string, TeamMemberProgress>>({});
const loadingTeamProgress = ref(false);
let refreshInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Load team progress from backend
 */
async function loadTeamProgress() {
  if (!currentUser.loggedIn) {
    teamMemberProgress.value = {};
    return;
  }
  
  loadingTeamProgress.value = true;
  try {
    const teams = await getTeams();
    const allProgress: Record<string, TeamMemberProgress> = {};
    
    for (const team of teams) {
      const progress = await getTeamProgress(team.id);
      for (const member of progress) {
        if (member.id !== currentUser.id) {
          allProgress[member.id] = member;
        }
      }
    }
    
    teamMemberProgress.value = allProgress;
  } catch (e) {
    console.error('Failed to load team progress:', e);
  } finally {
    loadingTeamProgress.value = false;
  }
}

/**
 * Composable for managing teammate stores
 */
export function useTeammateStores() {
  // Convert team member progress to store-like objects
  const teammateStores = ref<Record<string, Store<string, UserState>>>({});
  
  // Watch for changes in team member progress
  watch(teamMemberProgress, (progress) => {
    const stores: Record<string, any> = {};
    
    for (const [memberId, memberData] of Object.entries(progress)) {
      // Create a pseudo-store object that matches the expected interface
      stores[memberId] = {
        $state: {
          currentGameMode: 'pvp',
          gameEdition: 1,
          pvp: convertProgressToUserData(memberData),
          pve: { level: 1, pmcFaction: 'USEC', displayName: null, taskObjectives: {}, taskCompletions: {}, hideoutParts: {}, hideoutModules: {} },
        },
        $id: memberId,
      };
    }
    
    teammateStores.value = stores;
  }, { immediate: true, deep: true });

  const cleanup = () => {
    teammateStores.value = {};
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };
  
  // Start auto-refresh when user is logged in
  const startAutoRefresh = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    loadTeamProgress();
    // Refresh every 30 seconds
    refreshInterval = setInterval(loadTeamProgress, 30000);
  };

  return {
    teammateStores,
    cleanup,
    loadTeamProgress,
    startAutoRefresh,
    loadingTeamProgress,
  };
}

/**
 * Convert API progress data to UserProgressData format
 */
function convertProgressToUserData(member: TeamMemberProgress): UserProgressData {
  const taskCompletions: Record<string, { complete: boolean; failed: boolean; timestamp: number }> = {};
  const hideoutModules: Record<string, { complete: boolean; timestamp: number }> = {};
  
  if (member.tasks?.tasks) {
    for (const [taskId, taskData] of Object.entries(member.tasks.tasks)) {
      taskCompletions[taskId] = {
        complete: taskData.complete,
        failed: false,
        timestamp: Date.now(),
      };
    }
  }
  
  if (member.hideout?.modules) {
    for (const [moduleId, moduleData] of Object.entries(member.hideout.modules)) {
      hideoutModules[moduleId] = {
        complete: moduleData.complete,
        timestamp: Date.now(),
      };
    }
  }
  
  return {
    level: 1,
    pmcFaction: 'USEC',
    displayName: member.displayName || member.username,
    taskObjectives: {},
    taskCompletions,
    hideoutParts: {},
    hideoutModules,
  };
}
