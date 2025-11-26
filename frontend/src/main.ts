import { createApp } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import router from './router';
import i18n from './plugins/i18n';
import vuetify from './plugins/vuetify';
import pinia from './plugins/pinia';
import apolloClient from './plugins/apollo';
import { markInitialized } from './plugins/store-initializer';
import { markI18nReady } from '@/composables/utils/i18nHelpers';
import { initAuth } from './plugins/api';
import App from './App.vue';

// Initialize auth from localStorage
initAuth();

// Create app instance
const app = createApp(App);

// Global error handler for debugging
app.config.errorHandler = (err: unknown, vm: ComponentPublicInstance | null, info: string) => {
  console.error('Vue Error:', err);
  console.error('Component:', vm);
  console.error('Info:', info);
};

// Configure app with plugins
app.use(i18n);
markI18nReady();

app
  .use(pinia)
  .use(router)
  .use(vuetify)
  .provide(DefaultApolloClient, apolloClient)
  .mount('#app');

markInitialized();
