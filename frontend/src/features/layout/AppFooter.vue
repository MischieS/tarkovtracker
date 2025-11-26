<template>
  <v-footer
    class="px-0 d-flex"
    color="transparent"
    style="
      min-height: auto !important;
      height: auto !important;
      flex: 0 0 auto !important;
      margin-bottom: 0 !important;
      padding: 0 !important;
    "
  >
    <v-container class="text-center footer-background mx-0">
      <div class="text-center" style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">
        Self-Hosted TarkovTracker
      </div>
    </v-container>
  </v-footer>
</template>
<script setup>
</script>
<style lang="scss" scoped>
  .footer-background {
    background-color: rgba(0, 0, 0, 0.4);
    max-width: 100% !important;
    padding: 8px 16px;
    margin-bottom: 0 !important;
  }
  // Ensure the footer sits flush at bottom
  :deep(.v-footer) {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  :deep(.v-container) {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  // Force footer to bottom with no gaps
  :deep(.v-footer__extension) {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  :deep(.v-row) {
    margin-bottom: 0 !important;
  }
  :deep(.v-col) {
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
  }
  .footer-section {
    margin-bottom: 8px;
  }
  .footer-links {
    gap: 4px;
  }
  .footer-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 12px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    &:hover {
      color: rgba(var(--v-theme-primary), 1);
      text-decoration: none;
    }
    &:link,
    &:active,
    &:visited {
      color: rgba(255, 255, 255, 0.7);
    }
    &:hover {
      color: rgba(var(--v-theme-primary), 1);
    }
  }
  .footer-icon {
    color: currentColor;
    opacity: 0.8;
  }
  .kofi-link {
    background: linear-gradient(135deg, #ff5f5f 0%, #ff9500 100%);
    color: white !important;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 1px 4px rgba(255, 95, 95, 0.3);
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(255, 95, 95, 0.4);
      color: white !important;
    }
  }
  .support-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .support-text {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    line-height: 1.2;
  }
  .copyright-notice {
    line-height: 1.3;
    margin-bottom: 4px;
    color: rgba(255, 255, 255, 0.6);
  }
  .brand-copyright {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }
  // Icon specific styling
  :deep(.mdi-github) {
    color: #ffffff !important;
  }
  // Mobile responsive adjustments
  @media (max-width: 600px) {
    .footer-section {
      margin-bottom: 12px;
    }
    .kofi-link {
      margin-bottom: 4px;
    }
  }
</style>
