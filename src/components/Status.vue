<template>
  <div id="status-area">
    <span id="connection-status">
      <span>Status: </span>
      <span class="status connecting" v-if="connectionStatus == 'connecting'">Connecting...</span>
      <span class="status connected" v-else-if="connectionStatus == 'connected'">
        <template v-if="playerName">Connected to {{ connectedServerName }} as {{ playerName }}</template>
        <template v-else>Connected to {{ connectedServerName }}</template>
      </span>
      <span class="status disconnected" v-else-if="connectionStatus == 'disconnected'">Disconnected</span>
    </span>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-headline-small">Login</span>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="loginError" type="error" variant="tonal" density="compact" class="mb-3">{{ loginError }}</v-alert>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Username*" v-model="username" v-on:keyup.enter="login" required autofocus></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Password*" v-model="password" type="password" v-on:keyup.enter="login" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  label="Server*"
                  v-model="server"
                  :items="chatServers"
                  :loading="loadingServers"
                  item-title="label"
                  item-value="id"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" :disabled="!server" @click="login">
            Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { eventBus } from '@/lib/core/event_bus'
import { aoClient } from '@/lib/core/ao_client'
import { connectUrl, serverListUrl } from '@/lib/util'

// Backend URL set at build time; the chosen server id is appended to it
const websocketUrl = import.meta.env.VUE_APP_WEBSOCKET_URL || ""

const serverStorageKey = "aochat_server"
const serverNamePattern = /^[a-z0-9-]+$/

// The server last logged in to, or null
function storedServer() {
  try {
    return localStorage.getItem(serverStorageKey)
  } catch (e) {
    console.error("Failed to load the last server", e)
    return null
  }
}

function saveServer(server) {
  try {
    localStorage.setItem(serverStorageKey, server)
  } catch (e) {
    console.error("Failed to save the server", e)
  }
}

export default {
  name: "StatusModal",
  data: function() {
    return {
      connectionStatus: "disconnected",
      username: "",
      password: "",
      server: null,
      connectedServer: "",
      chatServers: [],
      loadingServers: false,
      loginError: "",
      dialog: true,
      playerName: ""
    }
  },
  computed: {
    connectedServerName() {
      return this.connectedServer.toUpperCase()
    }
  },
  methods: {
    openLoginModal() {
      if (this.chatServers.length === 0) {
        this.loadServers()
      }
      this.dialog = true
    },
    // Fills the server picker from the backend, selecting the last server used if it's still listed
    loadServers() {
      this.loadingServers = true
      this.loginError = ""
      return fetch(serverListUrl(websocketUrl))
        .then(response => {
          if (!response.ok) {
            throw new Error("HTTP " + response.status)
          }
          return response.json()
        })
        .then(body => {
          if (!body || !Array.isArray(body.servers) || body.servers.length === 0 ||
              !body.servers.every(s => s && typeof s.name === "string" && serverNamePattern.test(s.name))) {
            throw new Error("unexpected server list: " + JSON.stringify(body))
          }
          this.chatServers = body.servers.map(s => ({ id: s.name, label: s.name.toUpperCase() }))
          const stored = storedServer()
          this.server = this.chatServers.some(s => s.id === stored) ? stored : this.chatServers[0].id
        })
        .catch(e => {
          console.error("Failed to load the server list", e)
          this.loginError = "Couldn't load the server list. Reopen Login to try again."
        })
        .finally(() => {
          this.loadingServers = false
        })
    },
    login() {
      let url
      try {
        url = connectUrl(websocketUrl, this.server)
      } catch (e) {
        console.error("Invalid VUE_APP_WEBSOCKET_URL", websocketUrl, e)
        this.loginError = "This build has no valid backend URL (VUE_APP_WEBSOCKET_URL)."
        return
      }
      this.loginError = ""

      saveServer(this.server)
      this.connectedServer = this.server
      aoClient.connect(url, this.username, this.password)

      this.dialog = false
    },
    logout() {
      aoClient.disconnect()
    }
  },
  mounted: function() {
    const self = this

    eventBus.$on("connectionStatusChanged", function(oldStatus, newStatus) {
      self.connectionStatus = newStatus
      if (newStatus === "disconnected") {
        self.playerName = ""
      }
    })

    eventBus.$on("characterSelected", function(character) {
      self.playerName = character ? character.name : ""
    })

    this.connectionStatus = aoClient.isConnected() ? "connected" : "disconnected"
    this.loadServers()
  }
}
</script>

<style scoped>
#status-area {
}

.status {
  display: inline-block;
}

.disconnected {
  color: red;
}

.connecting {
  color: orange;
}

.connected {
  color: green;
}
</style>