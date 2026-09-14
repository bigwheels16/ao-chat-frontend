<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Tab Settings</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Tab Name"
                v-model="tabData.name"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-checkbox v-model="tabData.config.system" label="System Messages"></v-checkbox>
              <v-checkbox v-model="tabData.config.public" label="Public Channels"></v-checkbox>
              <v-checkbox v-model="tabData.config.org" label="Org Messages"></v-checkbox>
              <v-checkbox v-model="tabData.config.private_channel" label="Private Channels"></v-checkbox>
              <v-checkbox v-model="tabData.config.tell" label="Tells"></v-checkbox>
              <v-checkbox v-model="tabData.config.buddy" label="Buddy Notifications"></v-checkbox>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="red darken-1" text @click="deleteTab">
          Delete Tab
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "TabSettingsModal",
  data() {
    return {
      dialog: false,
      tabData: {
        id: "",
        name: "",
        config: {
          system: true,
          public: true,
          org: true,
          private_channel: true,
          tell: true,
          buddy: true
        }
      }
    }
  },
  watch: {
    tabData: {
      handler(newVal) {
        if (this.dialog) {
          this.$emit("update", newVal)
        }
      },
      deep: true
    }
  },
  methods: {
    open(tab) {
      const parsedTab = JSON.parse(JSON.stringify(tab))
      if (!parsedTab.config) {
        parsedTab.config = {}
      }
      const defaultConfig = {
        system: true,
        public: true,
        org: true,
        private_channel: true,
        tell: true,
        buddy: true
      }
      parsedTab.config = { ...defaultConfig, ...parsedTab.config }
      this.tabData = parsedTab
      this.dialog = true
    },
    close() {
      this.dialog = false
    },
    deleteTab() {
      this.$emit("delete", this.tabData.id)
      this.dialog = false
    }
  }
}
</script>
