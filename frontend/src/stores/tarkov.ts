import { defineStore } from 'pinia';
import { watch, ref } from 'vue';
import { currentUser } from '@/plugins/api';
import * as api from '@/plugins/api';
import {
  getters,
  actions,
  defaultState,
  migrateToGameModeStructure,
  type UserState,
  type UserActions,
  type GameMode,
} from '@/shared_state';

const STORAGE_KEY = 'tarkovtracker_progress';

// Track if we're syncing to prevent loops
let isSyncing = false;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

// Load state from localStorage
function loadFromStorage(): UserState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate if needed
      if (!parsed.currentGameMode || !parsed.pvp || !parsed.pve) {
        return migrateToGameModeStructure(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading progress from localStorage:', e);
  }
  return JSON.parse(JSON.stringify(defaultState));
}

// Save state to localStorage AND sync to backend if logged in
function saveToStorage(state: UserState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Sync to backend if logged in
    if (currentUser.loggedIn && !isSyncing) {
      syncToBackend(state);
    }
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}

// Sync state to backend API
function syncToBackend(state: UserState) {
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(async () => {
    if (!currentUser.loggedIn) return;
    
    try {
      isSyncing = true;
      const currentData = state[state.currentGameMode];
      
      // Sync task progress
      await api.setTaskProgress({
        tasks: Object.fromEntries(
          Object.entries(currentData.taskCompletions || {}).map(([id, data]) => [
            id,
            {
              complete: data.complete || false,
              objectives: {},
            },
          ])
        ),
      });
      
      // Sync hideout progress
      await api.setHideoutProgress({
        modules: Object.fromEntries(
          Object.entries(currentData.hideoutModules || {}).map(([id, data]) => [
            id,
            { complete: data.complete || false },
          ])
        ),
      });
      
      // Sync settings (level, faction, etc)
      await api.setSettings({
        level: currentData.level,
        pmcFaction: currentData.pmcFaction,
        gameEdition: state.gameEdition,
        currentGameMode: state.currentGameMode,
      });
    } catch (e) {
      console.error('Error syncing to backend:', e);
    } finally {
      isSyncing = false;
    }
  }, 1000); // Debounce 1 second
}

// Load progress from backend
async function loadFromBackend(): Promise<UserState | null> {
  if (!currentUser.loggedIn) return null;
  
  try {
    const [progress, settings] = await Promise.all([
      api.getAllProgress(),
      api.getSettings(),
    ]);
    
    const currentMode = (settings.currentGameMode as GameMode) || 'pvp';
    const state: UserState = {
      currentGameMode: currentMode,
      gameEdition: (settings.gameEdition as number) || 1,
      pvp: JSON.parse(JSON.stringify(defaultState.pvp)),
      pve: JSON.parse(JSON.stringify(defaultState.pve)),
    };
    
    // Apply settings to current mode
    state[currentMode].level = (settings.level as number) || 1;
    state[currentMode].pmcFaction = (settings.pmcFaction as 'USEC' | 'BEAR') || 'USEC';
    
    // Apply task completions
    if (progress.tasks?.tasks) {
      for (const [taskId, taskData] of Object.entries(progress.tasks.tasks)) {
        state[currentMode].taskCompletions[taskId] = {
          complete: taskData.complete,
          failed: false,
          timestamp: Date.now(),
        };
      }
    }
    
    // Apply hideout completions
    if (progress.hideout?.modules) {
      for (const [moduleId, moduleData] of Object.entries(progress.hideout.modules)) {
        state[currentMode].hideoutModules[moduleId] = {
          complete: moduleData.complete,
          timestamp: Date.now(),
        };
      }
    }
    
    return state;
  } catch (e) {
    console.error('Error loading from backend:', e);
    return null;
  }
}

export const useTarkovStore = defineStore('swapTarkov', {
  state: (): UserState => loadFromStorage(),
  getters: {
    ...getters,
  },
  actions: {
    ...(actions as UserActions),
    switchGameMode(mode: GameMode) {
      actions.switchGameMode.call(this, mode);
      saveToStorage(this.$state);
    },
    migrateDataIfNeeded() {
      const needsMigration =
        !this.currentGameMode ||
        !this.pvp ||
        !this.pve ||
        ((this as unknown as Record<string, unknown>).level !== undefined && !this.pvp?.level);

      if (needsMigration) {
        const currentState = JSON.parse(JSON.stringify(this.$state));
        const migratedData = migrateToGameModeStructure(currentState);
        this.$patch(migratedData);
        saveToStorage(this.$state);
      }
    },
    resetProgress() {
      const freshState = JSON.parse(JSON.stringify(defaultState));
      this.$patch(freshState);
      saveToStorage(freshState);
      
      // Also reset on backend
      if (currentUser.loggedIn) {
        api.resetProgress().catch(console.error);
      }
    },
    resetCurrentGameModeData() {
      const currentMode = this.getCurrentGameMode();
      const freshProgressData = JSON.parse(JSON.stringify(defaultState[currentMode]));
      this.$patch({ [currentMode]: freshProgressData });
      saveToStorage(this.$state);
    },
    // Save after any state change
    saveProgress() {
      saveToStorage(this.$state);
    },
    // Load from backend (call after login)
    async loadFromServer() {
      const backendState = await loadFromBackend();
      if (backendState) {
        isSyncing = true; // Prevent sync loop
        this.$patch(backendState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backendState));
        isSyncing = false;
      }
    },
  },
});

// Auto-save on state changes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
watch(
  () => {
    try {
      return useTarkovStore().$state;
    } catch {
      return null;
    }
  },
  (state) => {
    if (state && !isSyncing) {
      // Debounce saves
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveToStorage(state as UserState);
      }, 500);
    }
  },
  { deep: true }
);
