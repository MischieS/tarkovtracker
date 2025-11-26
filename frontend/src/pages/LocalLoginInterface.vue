<template>
  <div class="login-page">
    <v-container class="d-flex align-start justify-center pt-16">
      <v-row justify="center" class="w-100">
        <v-col cols="12" sm="8" md="5" lg="4">
          <!-- Already logged in -->
          <v-card v-if="currentUser.loggedIn" class="auth-card mx-auto" color="rgb(18, 25, 30)">
            <v-card-title class="text-h5 text-center py-4 font-weight-bold">
              Welcome back!
            </v-card-title>
            <v-card-text class="text-center">
              <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
              <p class="text-body-1">Signed in as {{ currentUser.displayName || currentUser.username }}</p>
              <v-btn color="primary" class="mt-4 mr-2" to="/">
                <v-icon start>mdi-view-dashboard</v-icon>
                Dashboard
              </v-btn>
              <v-btn color="error" variant="outlined" class="mt-4" @click="handleLogout">
                <v-icon start>mdi-logout</v-icon>
                Logout
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Login/Register Form -->
          <v-card v-else class="auth-card mx-auto" color="rgb(18, 25, 30)">
            <v-card-title class="text-h5 text-center py-4 font-weight-bold">
              {{ isLogin ? 'Sign In' : 'Create Account' }}
            </v-card-title>
            
            <v-card-text>
              <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
                {{ error }}
              </v-alert>
              
              <v-form @submit.prevent="handleSubmit">
                <v-text-field
                  v-model="username"
                  label="Username"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  :rules="[v => !!v || 'Required', v => v.length >= 3 || 'Min 3 characters']"
                />
                
                <v-text-field
                  v-if="!isLogin"
                  v-model="displayName"
                  label="Display Name (optional)"
                  prepend-inner-icon="mdi-badge-account"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  hint="How your name appears to teammates"
                />
                
                <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-inner-icon="mdi-lock"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  :rules="[v => !!v || 'Required', v => v.length >= 4 || 'Min 4 characters']"
                />
                
                <v-text-field
                  v-if="!isLogin"
                  v-model="confirmPassword"
                  label="Confirm Password"
                  prepend-inner-icon="mdi-lock-check"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  :rules="[v => !!v || 'Required', v => v === password || 'Passwords must match']"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  class="mb-4"
                >
                  {{ isLogin ? 'Sign In' : 'Create Account' }}
                </v-btn>
              </v-form>
            </v-card-text>
            
            <v-divider />
            
            <v-card-actions class="justify-center py-4">
              <span class="text-body-2 text-medium-emphasis">
                {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
              </span>
              <v-btn variant="text" color="primary" @click="isLogin = !isLogin">
                {{ isLogin ? 'Register' : 'Sign In' }}
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Info Card -->
          <v-card class="mt-4 mx-auto info-card" color="rgb(18, 25, 30)" variant="outlined">
            <v-card-text class="text-center">
              <v-icon color="primary" class="mb-2">mdi-server</v-icon>
              <div class="text-body-2 text-medium-emphasis">
                Self-Hosted TarkovTracker
              </div>
              <div class="text-caption text-disabled mt-1">
                Your data stays on your server
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, register, logout, currentUser } from '@/plugins/api';

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

function handleLogout() {
  logout();
}
</script>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background-image:
    radial-gradient(circle at 30% 20%, rgba(50, 50, 50, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 65%, rgba(40, 40, 40, 0.1) 0%, transparent 50%);
}

.auth-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.info-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-width: 300px;
}
</style>
