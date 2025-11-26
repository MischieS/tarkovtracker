// Re-export stores for backward compatibility
export { useSystemStore, useSystemStoreComposable } from '@/stores/useSystemStore';
export { useTeamStore, useTeammateStores } from '@/stores/useTeamStore';
export { useProgressStore } from '@/stores/progress';
import { useTeammateStores } from '@/stores/useTeamStore';
import { useSystemStoreComposable } from '@/stores/useSystemStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { useProgressStore } from '@/stores/progress';
import { useTarkovStore } from '@/stores/tarkov';

/**
 * Main composable for backward compatibility
 */
export function useLiveData() {
  const { teammateStores } = useTeammateStores();
  
  return {
    useTeamStore: () => useTeamStore(),
    useSystemStore: useSystemStoreComposable,
    useProgressStore,
    teammateStores,
    tarkovStore: useTarkovStore(),
  };
}
