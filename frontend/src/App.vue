<template>
  <v-app color="rgba(0, 0, 0, 1)">
    <router-view />
  </v-app>
</template>

<script setup>
  import { onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useAppStore } from '@/stores/app';
  import { useTarkovData } from '@/composables/tarkovdata';
  
  const appStore = useAppStore();
  const { locale } = useI18n({ useScope: 'global' });
  
  // Initialize Tarkov data globally
  useTarkovData();
  
  onMounted(() => {
    if (appStore.localeOverride) {
      locale.value = appStore.localeOverride;
    }
  });
</script>
<style lang="scss">
  // Set the font family for the application to Share Tech Mono
  .v-application {
    [class*='text-'] {
      font-family: 'Share Tech Mono', sans-serif !important;
      font-display: swap;
    }
    font-family: 'Share Tech Mono', sans-serif !important;
    font-display: swap;
  }
</style>
