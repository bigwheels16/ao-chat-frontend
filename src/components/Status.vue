<template v-slot:activator="{ on, attrs }">
  <div id="status-area">
    <span id="connection-status">
      <span>Status: </span>
      <span class="status connecting" v-if="connectionStatus == 'connecting'">Connecting...</span>
      <span class="status connected" v-else-if="connectionStatus == 'connected'">
        <template v-if="playerName">Connected as {{ playerName }}</template>
        <template v-else>Connected</template>
      </span>
      <span class="status disconnected" v-else-if="connectionStatus == 'disconnected'">Disconnected</span>
    </span>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Login</span>
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="hasCustomDefaultUrl"
            type="info"
            text
            dense
            dismissible
            class="mb-3"
          >
            Notice: The default WebSocket URL has changed to <strong>{{ defaultWebsocketUrl }}</strong>.
          </v-alert>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Username*" v-model="username" v-on:keyup.enter="login" required autofocus></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Password*" v-model="password" type="password" v-on:keyup.enter="login" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Websocket URL*"
                  v-model="websocketUrl"
                  v-on:keyup.enter="login"
                  :hint="'Default: ' + defaultWebsocketUrl"
                  persistent-hint
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn color="blue darken-1" text @click="login">
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

const configuredWsUrl = process.env.VUE_APP_WEBSOCKET_URL || process.env.VUE_APP_DEFAULT_WEBSOCKET_URL || ""

export default {
  name: "StatusModal",
  data: function() {
    return {
      connectionStatus: "disconnected",
      username: "",
      password: "",
      websocketUrl: configuredWsUrl,
      dialog: true,
      playerName: ""
    }
  },
  computed: {
    defaultWebsocketUrl() {
      if (configuredWsUrl) {
        return configuredWsUrl
      }
      return (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname + "/connect"
    },
    hasCustomDefaultUrl() {
      return Boolean(configuredWsUrl)
    }
  },
  methods: {
    openLoginModal() {
      this.dialog = true
    },
    login() {
      aoClient.connect(this.websocketUrl, this.username, this.password)

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

    if (!this.websocketUrl) {
      this.websocketUrl = this.defaultWebsocketUrl
    }
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