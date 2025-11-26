import { defineStore } from 'pinia';
import { watch } from 'vue';
import { currentUser } from '@/plugins/api';
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

// Save state to localStorage
function saveToStorage(state: UserState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving progress to localStorage:', e);
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
    if (state) {
      // Debounce saves
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveToStorage(state as UserState);
      }, 500);
    }
  },
  { deep: true }
);
