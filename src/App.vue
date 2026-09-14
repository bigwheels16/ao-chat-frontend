<template>
  <v-app id="app">
    <v-navigation-drawer app right v-model="drawer">
      <BuddyList ref="buddyList" />
    </v-navigation-drawer>

    <v-app-bar app color="primary">
      <div class="d-flex align-center">
        <h3>AO Web Chat v{{ version }}</h3>
      </div>

      <v-spacer></v-spacer>

      <v-btn text class="header-action-btn" v-if="connectionStatus === 'disconnected'" @click="showLogin" title="Login">
        <div class="d-flex flex-column align-center">
          <v-icon dense>mdi-login</v-icon>
          <span class="caption action-text">Login</span>
        </div>
      </v-btn>

      <v-btn text class="header-action-btn" v-else @click="logout" title="Logout">
        <div class="d-flex flex-column align-center">
          <v-icon dense>mdi-logout</v-icon>
          <span class="caption action-text">Logout</span>
        </div>
      </v-btn>

      <v-btn text class="header-action-btn" @click="showSettings" title="Settings">
        <div class="d-flex flex-column align-center">
          <v-icon dense>mdi-cog</v-icon>
          <span class="caption action-text">Settings</span>
        </div>
      </v-btn>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-main fluid class="fill-height style-v-main">
      <v-container fluid class="fill-height d-flex flex-column pa-2 style-v-container">
        <ChatWindow ref="chatWindow" />
        <ChatInput ref="chatInput" />
        <CharacterSelectModal ref="characterSelectModal" />
        <SettingsModal ref="settingsModal" />
      </v-container>
    </v-main>

    <v-footer app>
      <v-container fluid>
        <Status ref="status" />
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import ChatWindow from './components/ChatWindow'
import BuddyList from './components/BuddyList.vue'
import CharacterSelectModal from './components/CharacterSelectModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import ChatInput from './components/ChatInput.vue'
import Status from './components/Status.vue'
import versionText from '!!raw-loader!../version.txt'
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
  data: function() {
    return {
      drawer: true,
      version: versionText.trim(),
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

<style scoped>
#app {
  font-family: Verdana;
}
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