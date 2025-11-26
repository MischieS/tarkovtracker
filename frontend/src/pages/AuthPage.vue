<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>{{ isLogin ? 'Login' : 'Register' }}</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
              {{ error }}
            </v-alert>
            
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-icon="mdi-account"
                type="text"
                required
                :rules="[v => !!v || 'Username is required', v => v.length >= 3 || 'Min 3 characters']"
              />
              
              <v-text-field
                v-if="!isLogin"
                v-model="displayName"
                label="Display Name (optional)"
                prepend-icon="mdi-badge-account"
                type="text"
              />
              
              <v-text-field
                v-model="password"
                label="Password"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                :rules="[v => !!v || 'Password is required', v => v.length >= 4 || 'Min 4 characters']"
              />
              
              <v-text-field
                v-if="!isLogin"
                v-model="confirmPassword"
                label="Confirm Password"
                prepend-icon="mdi-lock-check"
                :type="showPassword ? 'text' : 'password'"
                required
                :rules="[v => !!v || 'Please confirm password', v => v === password || 'Passwords must match']"
              />
            </v-form>
          </v-card-text>
          
          <v-card-actions>
            <v-btn variant="text" @click="isLogin = !isLogin">
              {{ isLogin ? 'Need an account?' : 'Already have an account?' }}
            </v-btn>
            <v-spacer />
            <v-btn 
              color="primary" 
              :loading="loading"
              @click="handleSubmit"
            >
              {{ isLogin ? 'Login' : 'Register' }}
            </v-btn>
          </v-card-actions>
        </v-card>
        
        <v-card class="mt-4 pa-4 text-center" variant="outlined">
          <div class="text-body-2 text-medium-emphasis">
            Self-hosted TarkovTracker
          </div>
          <div class="text-caption text-disabled mt-1">
            Track your Tarkov progress with friends
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, register } from '@/plugins/api';

const router = useRouter();

const isLogin = ref(true);
const username = ref('');
const displayName = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  error.value = '';
  
  if (!username.value || username.value.length < 3) {
    error.value = 'Username must be at least 3 characters';
    return;
  }
  
  if (!password.value || password.value.length < 4) {
    error.value = 'Password must be at least 4 characters';
    return;
  }
  
  if (!isLogin.value && password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  loading.value = true;
  
  try {
    if (isLogin.value) {
      await login(username.value, password.value);
    } else {
      await register(username.value, password.value, displayName.value || undefined);
    }
    router.push('/');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    loading.value = false;
  }
}
</script>
