<template>
  <v-app class="app-root">
    <v-navigation-drawer location="right" v-model="drawer">
      <BuddyList ref="buddyList" />
    </v-navigation-drawer>

    <v-app-bar color="primary">
      <div class="d-flex align-center ml-4">
        <h3>AO Web Chat</h3>
      </div>

      <v-spacer></v-spacer>

      <v-btn variant="text" class="header-action-btn" v-if="connectionStatus === 'disconnected'" @click="showLogin" title="Login">
        <div class="d-flex flex-column align-center">
          <v-icon size="20" :icon="mdiLogin"></v-icon>
          <span class="text-body-small action-text">Login</span>
        </div>
      </v-btn>

      <v-btn variant="text" class="header-action-btn" v-else @click="logout" title="Logout">
        <div class="d-flex flex-column align-center">
          <v-icon size="20" :icon="mdiLogout"></v-icon>
          <span class="text-body-small action-text">Logout</span>
        </div>
      </v-btn>

      <v-btn variant="text" class="header-action-btn" @click="showSettings" title="Settings">
        <div class="d-flex flex-column align-center">
          <v-icon size="20" :icon="mdiCog"></v-icon>
          <span class="text-body-small action-text">Settings</span>
        </div>
      </v-btn>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-main class="fill-height style-v-main">
      <v-container fluid class="fill-height d-flex flex-column pa-2 style-v-container">
        <ChatWindow ref="chatWindow" />
        <ChatInput ref="chatInput" />
        <CharacterSelectModal ref="characterSelectModal" />
        <SettingsModal ref="settingsModal" />
      </v-container>
    </v-main>

    <v-footer app order="-1">
      <v-container fluid class="d-flex flex-wrap align-center pa-3">
        <Status ref="status" />
        <v-spacer></v-spacer>
        <span class="text-body-small text-medium-emphasis">Last updated: {{ lastUpdated }}</span>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import ChatWindow from './components/ChatWindow.vue'
import BuddyList from './components/BuddyList.vue'
import CharacterSelectModal from './components/CharacterSelectModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import ChatInput from './components/ChatInput.vue'
import Status from './components/Status.vue'
import { DateTime } from 'luxon'
import { mdiCog, mdiLogin, mdiLogout } from '@mdi/js'
import { eventBus } from '@/lib/core/event_bus'
import { aoClient } from '@/lib/core/ao_client'

export default {
  name: 'App',

  components: {
    ChatWindow,
    BuddyList,
    CharacterSelectModal,
    SettingsModal,
    ChatInput,
    Status
  },
  setup() {
    return { mdiCog, mdiLogin, mdiLogout }
  },
  data: function() {
    return {
      drawer: true,
      lastUpdated: DateTime.fromISO(import.meta.env.VUE_APP_BUILD_TIME).toFormat('yyyy-LL-dd HH:mm'),
      connectionStatus: "disconnected"
    }
  },
  methods: {
    showSettings() {
      this.$refs.settingsModal.open()
    },
    showLogin() {
      this.$refs.status.openLoginModal()
    },
    logout() {
      aoClient.disconnect()
    }
  },
  mounted: function() {
    const self = this
    eventBus.$on("connectionStatusChanged", function(oldStatus, newStatus) {
      self.connectionStatus = newStatus
    })
    this.connectionStatus = aoClient.isConnected() ? "connected" : "disconnected"
  }
};
</script>

<style>
/* App font, also for dialogs and menus, which render outside the app element */
.app-root,
.v-overlay-container {
  font-family: Verdana;
}
</style>

<style scoped>
.header-action-btn {
  height: auto !important;
  width: 72px !important;
  min-width: 72px !important;
  padding: 4px 0 !important;
}
.action-text {
  line-height: 1;
  margin-top: 2px;
  text-transform: none;
}
.style-v-main {
  height: 100vh;
  overflow: hidden;
}
.style-v-container {
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>