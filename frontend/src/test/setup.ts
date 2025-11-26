import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { config } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Mock Apollo Client
vi.mock('@apollo/client/core', () => ({
  ApolloClient: vi.fn(() => ({
    query: vi.fn(),
    mutate: vi.fn(),
  })),
  InMemoryCache: vi.fn(),
  gql: vi.fn(),
}));

// Create global test plugins
const vuetify = createVuetify({
  components,
  directives,
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      test: 'Test message',
    },
  },
});

const pinia = createPinia();

// Configure Vue Test Utils global plugins
config.global.plugins = [vuetify, i18n, pinia];

// Global test helpers
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
