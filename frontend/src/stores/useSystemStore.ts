import { defineStore } from 'pinia';
import { currentUser } from '@/plugins/api';

interface SystemState {
  tokens?: string[];
  team?: string | null;
}

/**
 * System store definition - simplified for local use
 */
export const useSystemStore = defineStore('system', {
  state: (): SystemState => ({
    tokens: [],
    team: null,
  }),
  getters: {
    userTokens(state) {
      return state?.tokens || [];
    },
    userTokenCount(state) {
      return state?.tokens?.length || 0;
    },
    userTeam(state) {
      return state.team || null;
    },
    userTeamIsOwn(state) {
      return state?.team === currentUser?.id || false;
    },
  },
});

/**
 * Composable for backward compatibility
 */
export function useSystemStoreComposable() {
  const systemStore = useSystemStore();

  return {
    systemStore,
    cleanup: () => {},
  };
}

// Alias for backward compatibility
export const useSystemStoreComposableAlias = useSystemStoreComposable;
