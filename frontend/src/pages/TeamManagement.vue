<template>
  <tracker-tip :tip="{ id: 'team' }"></tracker-tip>
  <v-container>
    <!-- Not logged in message -->
    <v-row v-if="!currentUser.loggedIn" justify="center">
      <v-col cols="12" md="6">
        <v-card class="pa-4 text-center">
          <v-icon size="64" color="warning" class="mb-4">mdi-account-lock</v-icon>
          <h2 class="mb-2">Login Required</h2>
          <p class="text-medium-emphasis mb-4">You need to be logged in to manage teams.</p>
          <v-btn color="primary" to="/login">
            <v-icon start>mdi-login</v-icon>
            Login
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Logged in - Team management -->
    <template v-else>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="pa-4">
            <v-card-title class="d-flex align-center">
              <v-icon start>mdi-account-group</v-icon>
              Team Management
            </v-card-title>
            <v-card-text>
              <p class="text-medium-emphasis mb-4">
                Create or join a team to share progress with friends.
              </p>
              
              <!-- Create Team -->
              <v-text-field
                v-model="newTeamName"
                label="Team Name"
                variant="outlined"
                density="comfortable"
                class="mb-2"
              />
              <v-btn 
                color="primary" 
                :loading="creating"
                :disabled="!newTeamName"
                @click="handleCreateTeam"
                class="mb-4"
              >
                <v-icon start>mdi-plus</v-icon>
                Create Team
              </v-btn>
              
              <v-divider class="my-4" />
              
              <!-- Join Team -->
              <v-text-field
                v-model="joinTeamId"
                label="Team ID to Join"
                variant="outlined"
                density="comfortable"
                hint="Get this from your friend"
                class="mb-2"
              />
              <v-btn 
                color="secondary" 
                :loading="joining"
                :disabled="!joinTeamId"
                @click="handleJoinTeam"
              >
                <v-icon start>mdi-account-plus</v-icon>
                Join Team
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Current Teams -->
      <v-row v-if="teams.length > 0" justify="center" class="mt-4">
        <v-col cols="12" md="8">
          <v-card class="pa-4">
            <v-card-title>
              <v-icon start>mdi-account-multiple</v-icon>
              Your Teams
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="team in teams"
                  :key="team.id"
                  class="mb-2"
                >
                  <template #prepend>
                    <v-avatar color="primary">
                      <v-icon>mdi-account-group</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ team.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    ID: {{ team.id }} • {{ team.members?.length || 0 }} members
                  </v-list-item-subtitle>
                  <template #append>
                    <v-btn
                      icon="mdi-content-copy"
                      variant="text"
                      size="small"
                      @click="copyTeamId(team.id)"
                    />
                    <v-btn
                      icon="mdi-logout"
                      variant="text"
                      size="small"
                      color="error"
                      @click="handleLeaveTeam(team.id)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Error/Success messages -->
      <v-snackbar v-model="showMessage" :color="messageColor" timeout="3000">
        {{ message }}
      </v-snackbar>
    </template>
  </v-container>
</template>
<script setup>
  import { ref, onMounted } from 'vue';
  import { defineAsyncComponent } from 'vue';
  import { currentUser, getTeams, createTeam, joinTeam, leaveTeam } from '@/plugins/api';
  
  const TrackerTip = defineAsyncComponent(() => import('@/features/ui/TrackerTip'));
  
  const teams = ref([]);
  const newTeamName = ref('');
  const joinTeamId = ref('');
  const creating = ref(false);
  const joining = ref(false);
  const showMessage = ref(false);
  const message = ref('');
  const messageColor = ref('success');
  
  async function loadTeams() {
    if (!currentUser.loggedIn) return;
    try {
      teams.value = await getTeams();
    } catch (e) {
      console.error('Failed to load teams:', e);
    }
  }
  
  async function handleCreateTeam() {
    if (!newTeamName.value) return;
    creating.value = true;
    try {
      await createTeam(newTeamName.value);
      newTeamName.value = '';
      await loadTeams();
      showSuccess('Team created!');
    } catch (e) {
      showError(e.message);
    } finally {
      creating.value = false;
    }
  }
  
  async function handleJoinTeam() {
    if (!joinTeamId.value) return;
    joining.value = true;
    try {
      await joinTeam(joinTeamId.value);
      joinTeamId.value = '';
      await loadTeams();
      showSuccess('Joined team!');
    } catch (e) {
      showError(e.message);
    } finally {
      joining.value = false;
    }
  }
  
  async function handleLeaveTeam(teamId) {
    try {
      await leaveTeam(teamId);
      await loadTeams();
      showSuccess('Left team');
    } catch (e) {
      showError(e.message);
    }
  }
  
  function copyTeamId(id) {
    navigator.clipboard.writeText(id);
    showSuccess('Team ID copied!');
  }
  
  function showSuccess(msg) {
    message.value = msg;
    messageColor.value = 'success';
    showMessage.value = true;
  }
  
  function showError(msg) {
    message.value = msg;
    messageColor.value = 'error';
    showMessage.value = true;
  }
  
  onMounted(() => {
    loadTeams();
  });
</script>
<style lang="scss" scoped></style>
