<template>
  <v-container class="h-100 pb-0 mb-0">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6">
          <v-card-title class="d-flex align-center">
            <v-icon start>mdi-cog</v-icon>
            Settings
          </v-card-title>
          <v-card-text>
            <p class="text-medium-emphasis mb-4">
              This is a self-hosted version of TarkovTracker. Settings are stored locally.
            </p>
            
            <v-alert type="info" variant="tonal" class="mb-4">
              Your progress is automatically saved to your browser's local storage.
            </v-alert>
            
            <v-btn color="error" @click="clearAllData" class="mt-4">
              <v-icon start>mdi-delete</v-icon>
              Clear All Local Data
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
  import { useTarkovStore } from '@/stores/tarkov';
  
  const tarkovStore = useTarkovStore();
  
  function clearAllData() {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.clear();
      tarkovStore.resetProgress();
      window.location.reload();
    }
  }
</script>
<style lang="scss" scoped>
  a:link,
  a:active,
  a:visited {
    color: rgba(var(--v-theme-link), 1);
  }
  .info-link {
    text-decoration: none;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .gap-3 {
    gap: 0.75rem;
  }

  // Responsive improvements
  @media (max-width: 960px) {
    .text-h3 {
      font-size: 2rem !important;
    }

    .text-h6 {
      font-size: 1.125rem !important;
    }
  }

  @media (max-width: 600px) {
    .text-h3 {
      font-size: 1.75rem !important;
    }

    .d-flex.justify-center.gap-3 {
      flex-direction: column;
      gap: 0.75rem;

      .v-btn {
        width: 100%;
      }
    }

    .d-flex.flex-wrap.gap-2 {
      gap: 0.25rem;

      .v-chip {
        margin: 0.125rem;
      }
    }
  }

  // Accessibility improvements
  .v-card:focus-visible {
    outline: 2px solid rgba(var(--v-theme-primary), 0.5);
    outline-offset: 2px;
  }

  .v-btn:focus-visible {
    outline: 2px solid rgba(var(--v-theme-on-surface), 0.5);
    outline-offset: 2px;
  }
</style>
