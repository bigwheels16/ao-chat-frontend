<template>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Settings</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Test"
                v-model="testSetting"
                hint="Sample setting value"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Packets Sent"
                :value="packetsSent"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Packets Received"
                :value="packetsReceived"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="cancel">
          Cancel
        </v-btn>
        <v-btn color="blue darken-1" text @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { aoClient } from "@/lib/core/ao_client"

export default {
  name: "SettingsModal",
  data() {
    return {
      dialog: false,
      testSetting: "",
      savedTestSetting: "",
      packetsSent: 0,
      packetsReceived: 0
    }
  },
  methods: {
    open() {
      this.loadSettings()
      this.packetsSent = aoClient.packetsSent
      this.packetsReceived = aoClient.packetsReceived
      this.dialog = true
    },
    loadSettings() {
      this.savedTestSetting = localStorage.getItem("setting_test") || ""
      this.testSetting = this.savedTestSetting
    },
    save() {
      this.savedTestSetting = this.testSetting
      localStorage.setItem("setting_test", this.testSetting)
      this.dialog = false
    },
    cancel() {
      this.testSetting = this.savedTestSetting
      this.dialog = false
    }
  },
  mounted() {
    this.loadSettings()
  }
}
</script>

<style scoped>
</style>
