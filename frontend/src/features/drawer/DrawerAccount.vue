<template>
  <v-list nav bg-color="transparent" class="mx-auto">
    <template v-if="currentUser.loggedIn">
      <v-list-group value="user-account-menu">
        <template #activator="{ props: activatorProps }">
          <template v-if="isCollapsed">
            <v-avatar v-bind="activatorProps" class="mx-auto" size="32" :class="'d-flex fake-link'">
              <v-img :src="avatarSrc" />
            </v-avatar>
          </template>
          <template v-else>
            <v-list-item
              v-bind="activatorProps"
              :title="userDisplayName"
              :prepend-avatar="avatarSrc"
            ></v-list-item>
          </template>
        </template>
        <drawer-item
          icon="mdi-lock"
          locale-key="logout"
          :is-collapsed="isCollapsed"
          @click.stop="handleLogout"
        />
      </v-list-group>
    </template>
    <template v-else>
      <drawer-item
        icon="mdi-fingerprint"
        locale-key="login"
        to="/login"
        :is-collapsed="isCollapsed"
      />
    </template>
  </v-list>
</template>
<script setup>
  import { currentUser, logout } from '@/plugins/api';
  import { defineAsyncComponent, computed } from 'vue';

  defineProps({
    isCollapsed: {
      type: Boolean,
      required: true,
    },
  });
  const DrawerItem = defineAsyncComponent(() => import('@/features/drawer/DrawerItem'));

  const avatarSrc = computed(() => {
    return '/img/default-avatar.svg';
  });

  const userDisplayName = computed(() => {
    return currentUser.displayName || currentUser.username || 'User';
  });

  function handleLogout() {
    logout();
  }
</script>
<style lang="scss" scoped>
  :global(
    body > div.v-overlay-container > div.allow-overflow > div.v-overlay__content > div.v-sheet
  ) {
    overflow-y: visible;
  }
  .fake-link {
    cursor: pointer;
  }
</style>
