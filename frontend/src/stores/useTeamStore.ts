import { ref } from 'vue';
import { defineStore } from 'pinia';
import { currentUser } from '@/plugins/api';
import type { Store } from 'pinia';
import type { UserState } from '@/shared_state';

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

/**
 * Composable for managing teammate stores - simplified without Firebase
 */
export function useTeammateStores() {
  // For now, just return empty stores since we're not using Firebase real-time sync
  // Team progress would need to be fetched from the local API
  const teammateStores = ref<Record<string, Store<string, UserState>>>({});

  const cleanup = () => {
    teammateStores.value = {};
  };

  return {
    teammateStores,
    cleanup,
  };
}
