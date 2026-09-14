<template>
  <div id="buddy-list-container">
    <v-treeview
      dense
      :items="buddyListTree"
      :open="open"
      id="buddy-list"
      open-on-click
      transition>
      <template v-slot:label="{ item }">
        <span class="tree-item-label" @click="setContext(item)" @contextmenu.prevent="showContextMenu($event, item)">
          {{ item.name }}
        </span>
      </template>
      <template v-slot:prepend="{ item }">
        <span class="tree-item-icon" @click="setContext(item)" @contextmenu.prevent="showContextMenu($event, item)">
          <v-icon v-if="item.online == 1" color="green">
            mdi-account
          </v-icon>
          <v-icon v-else-if="item.online == 0" color="red">
            mdi-account-outline
          </v-icon>
          <v-icon v-else-if="item.type == 'channel'" color="accent">
            mdi-account-group
          </v-icon>
          <v-icon v-else-if="item.type == 'privateChannel'" color="accent darken-2">
            mdi-account-multiple
          </v-icon>
          <v-icon v-else-if="item.type == 'guest'" color="green">
            mdi-account-star
          </v-icon>
          <v-icon v-else-if="item.type == 'category'">
            mdi-format-list-bulleted
          </v-icon>
        </span>
      </template>
    </v-treeview>

    <v-menu
      v-model="contextMenu.show"
      :position-x="contextMenu.x"
      :position-y="contextMenu.y"
      absolute
      offset-y
    >
      <v-list dense>
        <v-list-item v-if="hasWhoisOption" @click="runWhois">
          <v-list-item-title>Whois</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { eventBus } from '@/lib/core/event_bus'
import { aoClient } from '@/lib/core/ao_client'
import * as server_packets from '@/lib/aochat/server_packets'

export default {
  name: "BuddyList",
  data: function() {
    return {
      open: [],
      buddies: new Map(),
      buddyListTree: [],
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        item: null
      }
    }
  },
  computed: {
    hasWhoisOption() {
      if (!this.contextMenu.item || this.contextMenu.item.type === 'category' || this.contextMenu.item.type === 'channel') {
        return false
      }
      return true
    }
  },
  methods: {
    showContextMenu(e, item) {
      if (item.type === 'category') {
        return
      }
      e.preventDefault()
      this.contextMenu.show = false
      this.contextMenu.x = e.clientX
      this.contextMenu.y = e.clientY
      this.contextMenu.item = item
      this.$nextTick(() => {
        this.contextMenu.show = true
      })
    },
    runWhois() {
      if (this.contextMenu.item && this.contextMenu.item.name) {
        eventBus.$emit("chatCommand", "/tell helpbot whois " + this.contextMenu.item.name)
      }
    },
    // a computed getter
    updateBuddyListTree: function (oldBuddy, newBuddy) {
      if (oldBuddy) {
        const oldIndex = this.getBuddyTypeListIndex(oldBuddy)
        this.buddyListTree[oldIndex].children = this.buddyListTree[oldIndex].children.filter(item => item.id !== oldBuddy.id)
      }

      if (newBuddy) {
        const newIndex = this.getBuddyTypeListIndex(newBuddy)
        this.insertInOrder(newBuddy, this.buddyListTree[newIndex].children)
      }

      this.buddyListTree[0].name = "Online (" + this.buddyListTree[0].children.length + ")"
      this.buddyListTree[1].name = "Offline (" + this.buddyListTree[1].children.length + ")"
      this.buddyListTree[2].name = "Recent (" + this.buddyListTree[2].children.length + ")"
    },
    insertInOrder(item, itemList, sortKey = "name") {
      for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].name > item[sortKey]) {
          itemList.splice(i, 0, item)
          return
        }
      }

      // add buddy if it hasn't been added already
      itemList.push(item)
    },
    getBuddyTypeListIndex: function(buddy) {
      if (buddy.status != '\x01') {
        return 2
      } else if (buddy.online == 1) {
        return 0
      } else {
        return 1
      }
    },
    resetBuddyList: function() {
      this.buddyListTree = [
        {
          id: "online",
          name: "Online (0)",
          type: "category",
          children: [],
        },
        {
          id: "offline",
          name: "Offline (0)",
          type: "category",
          children: [],
        },
        {
          id: "recent",
          name: "Recent (0)",
          type: "category",
          children: [],
        },
        {
          id: "public_channels",
          name: "Channels (0)",
          type: "category",
          children: [],
        },
        {
          id: "private_channels",
          name: "Private Channels (0)",
          type: "category",
          children: [],
        },
        {
          id: "guests",
          name: "Guests (0)",
          type: "category",
          children: [],
        },
      ]
    },
    setContext: function(item) {
      let context = ""
      if (item.type == "category") {
        return
      } else if (item.type == "privateChannel" || item.type == "channel") {
        context = `/g "${item.name}"`
      } else {
        context = "/tell " + item.name
      }
      eventBus.$emit("chatCommand", context)
    }
  },
  mounted: function() {
    const self = this
    var firstOnlineBuddyRecieved = false

    // buddies
    eventBus.$receivePacket(server_packets.BuddyAdded.id, function(packet) {
      const newBuddy = {
        id: packet.charId,
        name: aoClient.getCharacterName(packet.charId),
        online: packet.online,
        status: packet.status
      }

      const oldBuddy = self.buddies.get(packet.charId)
      self.buddies.set(packet.charId, newBuddy)
      self.updateBuddyListTree(oldBuddy, newBuddy)

      if (oldBuddy && oldBuddy.online !== newBuddy.online) {
        eventBus.$emit("buddyStateChanged", {
          name: newBuddy.name,
          online: newBuddy.online
        })
      }

      if (!firstOnlineBuddyRecieved && newBuddy.online) {
        firstOnlineBuddyRecieved = true
        if (!self.open.includes("online")) {
          self.open.push("online")
        }
      }
    })

    eventBus.$receivePacket(server_packets.BuddyRemoved.id, function(packet) {
      const oldBuddy = self.buddies.get(packet.charId)
      self.buddies.delete(packet.charId)
      self.updateBuddyListTree(oldBuddy, null)
    })

    // public channels
    eventBus.$receivePacket(server_packets.PublicChannelJoined.id, function(packet) {
      const newChannel = {
        id: "public_channel_" + packet.channelId,
        name: packet.name,
        type: "channel"
      }

      const channelIndex = 3
      self.insertInOrder(newChannel, self.buddyListTree[channelIndex].children)
      self.buddyListTree[channelIndex].name = "Channels (" + self.buddyListTree[channelIndex].children.length + ")"
    })

    eventBus.$receivePacket(server_packets.PublicChannelLeft.id, function(packet) {
      const id = "public_channel_" + packet.channelId

      const channelIndex = 3
      self.buddyListTree[channelIndex].children = self.buddyListTree[channelIndex].children.filter(item => item.id !== id)
      self.buddyListTree[channelIndex].name = "Channels (" + self.buddyListTree[channelIndex].children.length + ")"
    })

    // private channels and guests
    eventBus.$receivePacket(server_packets.PrivateChannelClientJoined.id, function(packet) {
      if (aoClient.getCharId() == packet.privateChannelId) {
        const newGuest = {
          id: "guest_" + packet.charId,
          name: aoClient.getCharacterName(packet.charId),
          type: "guest"
        }

        const channelIndex = 5
        self.insertInOrder(newGuest, self.buddyListTree[channelIndex].children)
        self.buddyListTree[channelIndex].name = "Guests (" + self.buddyListTree[channelIndex].children.length + ")"
      } else if (aoClient.getCharId() == packet.charId) {
        const newChannel = {
          id: "private_channel_" + packet.privateChannelId,
          name: aoClient.getCharacterName(packet.privateChannelId),
          type: "privateChannel"
        }

        const channelIndex = 4
        self.insertInOrder(newChannel, self.buddyListTree[channelIndex].children)
        self.buddyListTree[channelIndex].name = "Private Channels (" + self.buddyListTree[channelIndex].children.length + ")"
      }
    })

    eventBus.$receivePacket(server_packets.PrivateChannelClientLeft.id, function(packet) {
      if (aoClient.getCharId() == packet.privateChannelId) {
        const id = "guest_" + packet.charId

        const channelIndex = 5
        self.buddyListTree[channelIndex].children = self.buddyListTree[channelIndex].children.filter(item => item.id != id)
        self.buddyListTree[channelIndex].name = "Guests (" + self.buddyListTree[channelIndex].children.length + ")"
      }
    })

    eventBus.$receivePacket(server_packets.PrivateChannelKicked.id, function(packet) {
      const id = "private_channel_" + packet.privateChannelId

      const channelIndex = 4
      self.buddyListTree[channelIndex].children = self.buddyListTree[channelIndex].children.filter(item => item.id != id)
      self.buddyListTree[channelIndex].name = "Private Channels (" + self.buddyListTree[channelIndex].children.length + ")"
    })

    eventBus.$on("connectionStatusChanged", function(oldStatus, newStatus) {
      self.resetBuddyList()
    })
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#buddy-list {
  overflow: auto;
  height: 100%;
}
#buddy-list >>> .v-treeview-node__root {
  width: 100%;
  cursor: pointer;
}
#buddy-list >>> .v-treeview-node__content {
  width: 100%;
  cursor: pointer;
}
.tree-item-label {
  display: inline-block;
  width: 100%;
  cursor: pointer;
}
.tree-item-icon {
  cursor: pointer;
}
</style>