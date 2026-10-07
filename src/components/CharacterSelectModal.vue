<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-headline-small">Character Select</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-select
              v-model="selectedCharacter"
              :items="characters"
              item-title="name"
              item-value="charId"
              label="Select"
              return-object
              single-line
              autofocus
              v-on:keypress.enter.prevent="selectCharacter"
            >
            <template v-slot:selection="{ item }">
              {{ item.name }}
            </template>
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <template v-slot:title>
                  {{ item.name }} (Lvl {{ item.level }})&nbsp;<span class="online text-green" v-if="item.online == 1">[Online]</span>
                </template>
              </v-list-item>
            </template>
            </v-select>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="cancel">
          Cancel
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="selectCharacter">
          Select
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { eventBus } from '@/lib/core/event_bus'
import { aoClient } from '@/lib/core/ao_client'
import { LoginCharacterList } from '@/lib/aochat/server_packets'
import { LoginSelect } from '@/lib/aochat/client_packets'

export default {
  name: "CharacterSelectModal",
  data: function() {
    return {
      dialog: false,
      characters: [],
      selectedCharacter: null
    }
  },
  methods: {
    selectCharacter() {
      if (this.selectedCharacter) {
        const packet = new LoginSelect(this.selectedCharacter.charId)
        eventBus.$sendPacket(packet)
        eventBus.$emit("characterSelected", this.selectedCharacter)
        this.dialog = false
      }
    },
    cancel() {
      aoClient.disconnect()
      this.dialog = false
    }
  },
  mounted: function() {
    const self = this

    eventBus.$receivePacket(LoginCharacterList.id, function(packet) {
      self.dialog = true
      self.characters = []
      for (let i = 0; i < packet.charIds.length; i++) {
        self.characters.push({
          charId: packet.charIds[i],
          name: packet.names[i],
          level: packet.levels[i],
          online: packet.onlineStatuses[i]
        })
      }
    })
  }
}
</script>

<style scoped>

</style>