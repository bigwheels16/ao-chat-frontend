<template>
  <v-container id="chat-window" fluid class="d-flex flex-column flex-grow-1" style="min-height: 0;">
    <div class="d-flex align-center flex-grow-0 flex-shrink-0">
      <v-tabs v-model="tabIndex" background-color="" style="flex: 1; min-width: 0;">
        <v-tab v-for="item in items" :key="item.id">
          {{ item.name }}
        </v-tab>
      </v-tabs>
      <v-btn icon @click="addTab" class="ml-2">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>
    <v-tabs-items v-model="tabIndex" class="flex-grow-1 d-flex flex-column style-tab-items">
      <v-tab-item v-for="(item, index) in items" :key="item.id" class="fill-height style-tab-item">
        <v-btn icon absolute top right @click="openTabSettings(item)" style="z-index: 10; margin-top: 10px; margin-right: 10px;">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
        <div class="chat-window" :id="'chat-window-' + index">
          <div v-for="(obj, idx) in tabMessages(index)" :key="idx">
              <span>[{{ obj.timestamp }}]</span>
              <span v-html="obj.msg" :class="obj.className"></span>
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="showBlobWindow" width="80%" id="blob-window" v-if="showBlobWindow">
      <v-card id="blob-window-card">
        <v-card-actions>
          <v-btn color="green darken-1" absolute top right text @click="showBlobWindow = null">
            Close
          </v-btn>
        </v-card-actions>
        <v-card-text v-html="blobWindowContent"></v-card-text>
      </v-card>
    </v-dialog>
    <TabSettingsModal ref="tabSettingsModal" @update="updateTab" @delete="deleteTab" />
  </v-container>
</template>

<script>
import { DateTime } from 'luxon'
import { eventBus } from '@/lib/core/event_bus'
import { aoClient } from '@/lib/core/ao_client'
import { mmdbParser } from '@/lib/aochat/mmdb_parser'
import * as server_packets from '@/lib/aochat/server_packets'
import * as client_packets from '@/lib/aochat/client_packets'
import DOMPurify from 'dompurify'
import { split, escapeHtml } from '@/lib/util'
import util from 'util'
import TabSettingsModal from './TabSettingsModal.vue'

const defaultTabs = [
  { id: "uuid-1", name: "General", config: { system: true, public: true, org: true, private_channel: true, tell: true, buddy: true } },
  { id: "uuid-2", name: "Tells", config: { system: false, public: false, org: false, private_channel: false, tell: true, buddy: false } },
  { id: "uuid-3", name: "Org", config: { system: false, public: false, org: true, private_channel: false, tell: false, buddy: false } },
  { id: "uuid-4", name: "Buddy Log", config: { system: false, public: false, org: false, private_channel: false, tell: false, buddy: true } }
];

export default {
  name: "ChatWindow",
  components: {
    TabSettingsModal
  },
  data() {
    return {
      showBlobWindow: false,
      blobWindowContent: "",
      tabIndex: null,
      messages: [],
      items: [],
    }
  },
  created() {
    this.loadTabs();
  },
  computed: {
    tabMessages: function() {
      return (tabIndex) => {
        const tab = this.items[tabIndex];
        if (!tab) return [];
        const config = tab.config;
        return this.messages.filter(msg => {
          if (msg.className === "system" || msg.className === "default") {
             return config.system;
          } else if (msg.className === "public-message" || msg.className === "towers") {
             return config.public;
          } else if (msg.className === "org-message") {
             return config.org;
          } else if (msg.className === "private-channel-message") {
             return config.private_channel;
          } else if (msg.className === "private-message") {
             return config.tell;
          } else if (msg.className === "buddy-log") {
             return config.buddy;
          } else {
             return config.system; // Fallback for unknown classes -> default to system
          }
        });
      };
    }
  },
  methods: {
    loadTabs() {
      try {
        const stored = localStorage.getItem('aochat_tabs_config')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const isValid = parsed.every(tab => {
              return tab &&
                     typeof tab.id === 'string' &&
                     typeof tab.name === 'string' &&
                     tab.config &&
                     typeof tab.config === 'object' &&
                     typeof tab.config.system === 'boolean' &&
                     typeof tab.config.public === 'boolean' &&
                     typeof tab.config.org === 'boolean' &&
                     typeof tab.config.private_channel === 'boolean' &&
                     typeof tab.config.tell === 'boolean' &&
                     typeof tab.config.buddy === 'boolean';
            });
            if (isValid) {
              this.items = parsed
              return
            }
          }
        }
      } catch (e) {
        console.error("Failed to load tabs", e)
      }
      this.items = JSON.parse(JSON.stringify(defaultTabs))
      this.saveTabs()
    },
    saveTabs() {
      localStorage.setItem('aochat_tabs_config', JSON.stringify(this.items))
    },
    addTab() {
      const newTab = {
        id: Math.random().toString(36).substr(2, 9),
        name: "New Tab",
        config: {
          system: true,
          public: true,
          org: true,
          private_channel: true,
          tell: true,
          buddy: true
        }
      }
      this.items.push(newTab)
      this.saveTabs()
      this.tabIndex = this.items.length - 1
    },
    openTabSettings(tab) {
      this.$refs.tabSettingsModal.open(tab)
    },
    updateTab(updatedTab) {
      const index = this.items.findIndex(t => t.id === updatedTab.id)
      if (index !== -1) {
        this.items.splice(index, 1, updatedTab)
        this.saveTabs()
      }
    },
    deleteTab(tabId) {
      if (this.items.length <= 1) return // Prevent deleting the last tab
      const index = this.items.findIndex(t => t.id === tabId)
      if (index !== -1) {
        this.items.splice(index, 1)
        this.saveTabs()
        if (this.tabIndex >= this.items.length) {
          this.tabIndex = this.items.length - 1
        }
      }
    },
    addMessage: function(message, className="default") {
      const obj = {
        className: className,
        msg: message,
        timestamp: DateTime.now().toFormat("hh:mm:ss a")
      };
      this.messages.push(obj)

      // scroll to bottom
      const container = this.$el.querySelector("#chat-window-" + this.tabIndex)
      if (container && Math.round(container.scrollHeight - container.scrollTop) - container.clientHeight < 20) {
        this.$nextTick(() => {
          container.scrollTop = container.scrollHeight
        })
      }
    },
    cleanHtml: function(input) {
      return DOMPurify.sanitize(input, {
        USE_PROFILES: {html: true},
        ADD_ATTR: ['target'],
        IN_PLACE: true
      });
    },
    showBlob: function(content) {
      this.blobWindowContent = content
      this.showBlobWindow = true
    },
    getPublicChannelClass: function(packet) {
      if (packet.channelId == 42949672960 || packet.channelId == 42949672962) {
        // "All Towers" or "Tower Battle Outcome"
        return "towers"
      } else if (packet.channelId == 42949672961) {
        // "Org Msg"
        return "org-message"
      } else {
        const orgChannel = aoClient.getOrgChannel()
        if (orgChannel && orgChannel.channelId == packet.channelId) {
          return "org-message"
        } else {
          return "public-message"
        }
      }
    },
    wrapClickAction: function(commandString, label) {
      const b64 = Buffer(commandString).toString("base64")
      
      return `<span onclick="chatCommand('${b64}'); return false;" title="${escapeHtml(commandString)}" class="chat-command">${label}</span>`
    }
  },
  mounted: function() {
    document.showBlobWindow = (contents) => {
      // const win = window.open("", "Blob Window", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width="+(window.innerWidth*.8)+",height="+(window.innerHeight*.8)+",top=200,left=200");
      // win.document.body.innerHTML = Buffer.from(contents, "base64");
      // win.document.body.style.backgroundColor = "black";
      // win.document.body.style.fontFamily = '"Roboto", sans-serif';
      eventBus.$emit("blobWindow", Buffer.from(contents, "base64"))
    }

    document.chatCommand = (message) => {
      eventBus.$emit("chatCommand", Buffer.from(message, "base64").toString())
      this.showBlobWindow = false
    }

    // needed for development
    DOMPurify.removeAllHooks()

    DOMPurify.addHook("beforeSanitizeAttributes", (currentNode) => {
      if (currentNode.nodeName == "A") {
        if (currentNode.href.startsWith("chatcmd:///start ")) {
          const newUrl = currentNode.href.substring(17)
          currentNode.href = newUrl
          currentNode.target = "_blank"
          currentNode.title = newUrl
          currentNode.classList.add("text-decoration-underline")
        } else if (currentNode.href.startsWith("itemref://")) {
          const itemsUrl = "https://auno.org/ao/db.php?id=%d&ql=%d"
          const [lowId, highId, ql] = split(currentNode.href.substring(10), "/", 3)
          currentNode.href = util.format(itemsUrl, lowId, ql)
          currentNode.target = "_blank"
          currentNode.title = currentNode.href
          currentNode.classList.add("text-decoration-underline")
        }
      } else if (currentNode.nodeName == "IMG") {
        if (currentNode.src.startsWith("rdb://")) {
          const imgUrl = "https://u3.auno.org/res/aoicons/%d.gif"
          const iconId = currentNode.src.substring(6)
          currentNode.src = util.format(imgUrl, iconId)
        }
      }
      return currentNode
    })

    DOMPurify.addHook("uponSanitizeAttribute", (currentNode, hookEvent) => {
      if (currentNode.nodeName == "A" && hookEvent.attrName == "href") {
        if (hookEvent.attrValue.startsWith("text://")) {
          const contents = Buffer(this.cleanHtml(hookEvent.attrValue.substring(7))).toString("base64")
          currentNode.setAttribute("onclick", "showBlobWindow('" + contents + "'); return false;")
          currentNode.classList.add("text-decoration-underline")
          currentNode.setAttribute("title", "open blob window")
        } else if (currentNode.href.startsWith("user://")) {
          const chatCommandString = "/tell " + this.cleanHtml(hookEvent.attrValue.substring(7))
          const b64 = Buffer(chatCommandString).toString("base64")
          currentNode.setAttribute("onclick", "chatCommand('" + b64 + "'); return false;")
          currentNode.setAttribute("title", chatCommandString)
          currentNode.classList.add("text-decoration-underline")
        } else if (hookEvent.attrValue.startsWith("chatcmd://")) {
          const chatCommandString = this.cleanHtml(hookEvent.attrValue.substring(10))
          const b64 = Buffer(chatCommandString).toString("base64")
          currentNode.setAttribute("onclick", "chatCommand('" + b64 + "'); return false;")
          currentNode.setAttribute("title", chatCommandString)
          currentNode.classList.add("text-decoration-underline")
        } else {
          const chatCommandString = this.cleanHtml(hookEvent.attrValue)
          currentNode.setAttribute("title", chatCommandString)
          currentNode.classList.add("text-decoration-underline")
        }
      }
      return currentNode
    })

    eventBus.$on("blobWindow", (contents) => {
      this.showBlob(contents)
    })

    eventBus.$on("connectionStatusChanged", (oldStatus, newStatus) => {
      this.addMessage("State changed to " + newStatus)
    })

    eventBus.$receivePacket(server_packets.LoginOK.id, (packet) => {
      this.addMessage("Logged in successfully!")
    })

    eventBus.$receivePacket(server_packets.LoginError.id, (packet) => {
      this.addMessage(packet.message)
    })

    eventBus.$receivePacket(server_packets.BroadcastMessage.id, (packet) => {
      this.addMessage(packet.message, "system")
    })

    eventBus.$receivePacket(server_packets.SimpleSystemMessage.id, (packet) => {
      this.addMessage(packet.message, "system")
    })

    eventBus.$receivePacket(server_packets.SystemMessage.id, (packet) => {
      const message = mmdbParser.get(20000, packet.messageId)
      const params = mmdbParser.parseParams(Buffer(packet.messageArgs))
      this.addMessage(util.format(message, ...params))
    })

    eventBus.$receivePacket(server_packets.PrivateMessage.id, (packet) => {
      const charName = aoClient.getCharacterName(packet.charId)
      const charDisplay = this.wrapClickAction(`/tell ${charName}`, charName)
      this.addMessage("[" + charDisplay + "]: " + this.cleanHtml(packet.message), "private-message")
    })
    eventBus.$on("outgoing[" + client_packets.PrivateMessage.id + "]", (packet) => {
      const charName = aoClient.getCharacterName(packet.charId)
      const charDisplay = this.wrapClickAction(`/tell ${charName}`, charName)
      this.addMessage("To [" + charDisplay + "]: " + this.cleanHtml(packet.message), "private-message")
    })

    eventBus.$receivePacket(server_packets.PublicChannelMessage.id, (packet) => {
      const className = this.getPublicChannelClass(packet)
      const channelName = aoClient.getChannelName(packet.channelId)
      const channelDisplay = this.wrapClickAction(`/g "${channelName}"`, channelName)

      if (packet.charId != 0) {
        const charName = aoClient.getCharacterName(packet.charId)
        const charDisplay = this.wrapClickAction(`/tell ${charName}`, charName)

        this.addMessage(`[${channelDisplay}] ${charDisplay}: ${this.cleanHtml(packet.message)}`, className)
      } else {
        let message = packet.message
        if (message.startsWith("~&") && message.endsWith("~")) {
          const buffer = Buffer.from(message.substring(2, message.length - 1))
          const categoryId = mmdbParser.readBase85(buffer.slice(0, 5))
          const instanceId = mmdbParser.readBase85(buffer.slice(5, 10))
          const template = mmdbParser.get(categoryId, instanceId)
          const params = mmdbParser.parseParams(buffer.slice(10))

          message = util.format(template, ...params)
        }
        this.addMessage(`[${channelDisplay}] ${this.cleanHtml(message)}`, className)
      }
    })

    eventBus.$receivePacket(server_packets.PrivateChannelClientJoined.id, (packet) => {
      const privateChannelName = aoClient.getCharacterName(packet.privateChannelId)
      const privateChannelDisplay = this.wrapClickAction(`/g "${privateChannelName}"`, privateChannelName)
      const charName = aoClient.getCharacterName(packet.charId)
      const charDisplay = this.wrapClickAction(`/tell ${charName}`, charName)

      this.addMessage(`[${privateChannelDisplay}] ${charDisplay} joined the private channel.`, "private-channel-message")
    })

    eventBus.$receivePacket(server_packets.PrivateChannelClientLeft.id, (packet) => {
      const privateChannelName = aoClient.getCharacterName(packet.privateChannelId)
      const privateChannelDisplay = this.wrapClickAction(`/g "${privateChannelName}"`, privateChannelName)
      const charName = aoClient.getCharacterName(packet.charId)
      const charDisplay = this.wrapClickAction(`/tell ${charName}`, charName)

      this.addMessage(`[${privateChannelDisplay}] ${charDisplay} left the private channel.`, "private-channel-message")
    })

    eventBus.$receivePacket(server_packets.PrivateChannelMessage.id, (packet) => {
      const privateChannelName = aoClient.getCharacterName(packet.privateChannelId)
      const privateChannelDisplay = this.wrapClickAction(`/g "${privateChannelName}"`, privateChannelName)
      const charName = aoClient.getCharacterName(packet.charId)
      const charDisplay = this.wrapClickAction(`/tell ${charName}`, charName)

      this.addMessage(`[${privateChannelDisplay}] ${charDisplay}: ${this.cleanHtml(packet.message)}`, "private-channel-message")
    })

    eventBus.$receivePacket(server_packets.PrivateChannelInvited.id, (packet) => {
      const privateChannelName = aoClient.getCharacterName(packet.privateChannelId)
      const privateChannelDisplay = this.wrapClickAction(`/g "${privateChannelName}"`, privateChannelName)

      const chatCommandString = `/accept ${privateChannelName}`
      const b64 = Buffer(chatCommandString).toString("base64")
      const acceptLink = `<a onclick="chatCommand('${b64}')" title="${chatCommandString}" class="text-decoration-underline">Accept Invite</a>`

      this.addMessage(`[${privateChannelDisplay}] You have been invited to the private channel. ${acceptLink}`, "private-channel-message")
    })

    eventBus.$receivePacket(server_packets.PrivateChannelKicked.id, (packet) => {
      const privateChannelName = aoClient.getCharacterName(packet.privateChannelId)
      const privateChannelDisplay = this.wrapClickAction(`/g "${privateChannelName}"`, privateChannelName)

      this.addMessage(`[${privateChannelDisplay}] You have left the private channel.`, "private-channel-message")
    })

    eventBus.$on("buddyStateChanged", (event) => {
      const action = event.online ? "logged on" : "logged off"
      this.addMessage(`${escapeHtml(event.name)} ${action}.`, "buddy-log")
    })

    eventBus.$on("chatMessage", (message) => {
      this.addMessage(message)
    })
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.style-tab-items {
  min-height: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}
.style-tab-item {
  height: 100% !important;
  min-height: 0 !important;
  overflow: hidden !important;
  position: relative !important;
}
.chat-window {
  overflow-y: auto !important;
  overflow-x: auto !important;
  width: 100%;
  height: 100%;
  padding-top: 10px;
  box-sizing: border-box;
  white-space: pre-wrap;
}
span {
  margin: 0px 2px;
}
#blob-window-card {
  white-space: pre-wrap;
}
</style>

<style>
span.private-message {
  color: #00f5f6;
}
span.org-message {
  color: #02c20a;
}
span.private-channel-message {
  color: #d9dcdf;
}
span.system {
  color: #f6f741;
}
span.public-message {
  color: #5ff597;
}
span.default {
  color: lightcoral;
}
span.towers {
  color: #d857dd;
}
span.buddy-log {
  color: #88ccff;
}
span.chat-command:hover {
  text-decoration: underline;
  cursor: pointer;
}
.style-tab-items > .v-window__container,
.style-tab-items > .v-window__container > .v-window-item {
  height: 100% !important;
}
</style>