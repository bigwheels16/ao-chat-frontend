import { aoClient } from '@/lib/core/ao_client'
import { eventBus } from '@/lib/core/event_bus'
import * as client_packets from '@/lib/aochat/client_packets'
import * as server_packets from '@/lib/aochat/server_packets'
import { split, capitalizeFirstLetter, splitByDelimiters } from '@/lib/util'


const tell_command = {
  name: "tell",
  triggers: ["tell"],
  description: "Send a tell message to a character. Example: /tell Tyrence hello",
  init: function() {
    //
  },
  handler: function(inputText) {
    let [charName, message] = split(inputText, " ", 2)
    charName = capitalizeFirstLetter(charName)

    if (message) {
      aoClient.getCharacterId(charName).then(function(charId) {
        if (charId) {
          const packet = new client_packets.PrivateMessage(charId, message, '\x00')
          eventBus.$sendPacket(packet)
        } else {
          eventBus.$emit("chatMessage", `Could not find character "${charName}".`)
        }
      })
    } else {
      eventBus.$emit("newContext", `/tell ${charName}`)
    }
  }
}

const org_command = {
  name: "org",
  triggers: ["o"],
  description: "Send an org message. Example: /o Hello friends",
  init: function() {
    //
  },
  handler: function(inputText) {
    if (inputText) {
      const orgChannel = aoClient.getOrgChannel()
      if (orgChannel) {
        const packet = new client_packets.PublicChannelMessage(orgChannel.channelId, inputText, '\x00')
        eventBus.$sendPacket(packet)
      } else {
        eventBus.$emit("chatMessage", "Could not find org channel.")
      }
    } else {
      eventBus.$emit("newContext", `/o`)
    }
  }
}

const cc_command = {
  name: "cc",
  triggers: ["cc"],
  description: "Issue a chat command. Example: /cc addbuddy Tyrence",
  init: function() {
    //
  },
  handler: function(inputText) {
    const args = split(inputText, " ")
    if (args.length > 0) {
      const packet = new client_packets.ChatCommand(args, 0)
      eventBus.$sendPacket(packet)
    } else {
      eventBus.$emit("chatMessage", `Invalid command format.`)
    }
  }
}

const reply_command = {
  name: "reply",
  triggers: ["r"],
  description: "Send a tell message to the last person who sent you a tell. Example: /r Hello",
  replyTo: null,
  init: function() {
    const self = this

    eventBus.$receivePacket(server_packets.PrivateMessage.id, function(packet) {
      self.replyTo = packet.charId
    })
  },
  handler: function(inputText) {
    if (this.replyTo) {
      if (inputText) {
        const packet = new client_packets.PrivateMessage(this.replyTo, inputText, '\x00')
        eventBus.$sendPacket(packet)
      } else {
        const charName = aoClient.getCharacterName(this.replyTo)
        eventBus.$emit("newContext", `/tell ${charName}`)
      }
    } else {
      eventBus.$emit("chatMessage", `No character to reply to.`)
    }
  }
}

const invite_command = {
  name: "invite",
  triggers: ["invite"],
  description: "Invite someone to your private channel. Example: /invite Tyrence",
  init: function() {
    //
  },
  handler: function(inputText) {
    const charName = capitalizeFirstLetter(inputText)

    aoClient.getCharacterId(charName).then(function(charId) {
      if (charId) {
        const packet = new client_packets.PrivateChannelInvite(charId)
        eventBus.$sendPacket(packet)
        eventBus.$emit("chatMessage", `Inviting ${charName} to your private channel.`)
      } else {
        eventBus.$emit("chatMessage", `Could not find character "${charName}".`)
      }
    })
  }
}

const kick_command = {
  name: "kick",
  triggers: ["kick"],
  description: "Kick someone from your private channel. Example: /kick Tyrence",
  init: function() {
    //
  },
  handler: function(inputText) {
    const charName = capitalizeFirstLetter(inputText)

    aoClient.getCharacterId(charName).then(function(charId) {
      if (charId) {
        const packet = new client_packets.PrivateChannelKick(charId)
        eventBus.$sendPacket(packet)
        eventBus.$emit("chatMessage", `Kicking ${charName} from your private channel.`)
      } else {
        eventBus.$emit("chatMessage", `Could not find character "${charName}".`)
      }
    })
  }
}

const kick_all_command = {
  name: "kick_all",
  triggers: ["kickall"],
  description: "Kick all characters from your private channel. Example: /kickall",
  init: function() {
    //
  },
  handler: function(inputText) {
    const packet = new client_packets.PrivateChannelKickAll()
    eventBus.$sendPacket(packet)
    eventBus.$emit("chatMessage", `Kicking all characters from your private channel.`)
  }
}

const leave_command = {
  name: "leave",
  triggers: ["leave"],
  description: "Leave a private channel. Example: /leave Tyrence",
  init: function() {
    //
  },
  handler: function(inputText) {
    const charName = capitalizeFirstLetter(inputText)

    aoClient.getCharacterId(charName).then(function(charId) {
      if (charId) {
        const packet = new client_packets.PrivateChannelLeave(charId)
        eventBus.$sendPacket(packet)
      } else {
        eventBus.$emit("chatMessage", `Could not find character "${charName}".`)
      }
    })
  }
}

const join_command = {
  name: "join",
  triggers: ["join", "accept"],
  description: "Accept a private channel invitation. Example: /join Tyrence",
  init: function() {
    //
  },
  handler: function(inputText) {
    const charName = capitalizeFirstLetter(inputText)

    aoClient.getCharacterId(charName).then(function(charId) {
      if (charId) {
        const packet = new client_packets.PrivateChannelJoin(charId)
        eventBus.$sendPacket(packet)
      } else {
        eventBus.$emit("chatMessage", `Could not find character "${charName}".`)
      }
    })
  }
}

const private_channel_message_command = {
  name: "private_channel_message",
  triggers: ["g"],
  description: "Send a message to a private channel. Example: /g Tyrence Hello friends",
  channels: [],
  init: function() {
    const self = this

    // TODO add own private channel

    eventBus.$receivePacket(server_packets.PrivateChannelKicked.id, function(packet) {
      self.channels = self.channels.filter(x => x.id != packet.privateChannelId)
    })

    eventBus.$receivePacket(server_packets.PrivateChannelClientJoined.id, function(packet) {
      if (aoClient.getCharId() == packet.charId && aoClient.getCharId() != packet.privateChannelId) {
        const channel = {
          id: packet.privateChannelId,
          name: aoClient.getCharacterName(packet.privateChannelId),
          canSend: true,
          sendMessage: function(message) {
            const p = new client_packets.PrivateChannelMessage(this.id, message, '\x00')
            eventBus.$sendPacket(p)
          }
        }
        self.channels.push(channel)
      }
    })

    eventBus.$receivePacket(server_packets.PublicChannelJoined.id, function(packet) {
      const channel = {
        id: packet.channelId,
        name: packet.name,
        canSend: (packet.unknown & 0x2) == 0,
        sendMessage: function(message) {
          const p = new client_packets.PublicChannelMessage(this.id, message, '\x00')
          eventBus.$sendPacket(p)
        }
      }
      self.channels.push(channel)
    })

    eventBus.$receivePacket(server_packets.PublicChannelLeft.id, function(packet) {
      self.channels = self.channels.filter(x => x.id != packet.channelId)
    })
  },
  handler: function(inputText) {
    const [channelName, message] = splitByDelimiters(inputText)

    const channel = this.channels.find(x => x.name.toLowerCase() == channelName.toLowerCase())

    if (channel) {
      if (!channel.canSend) {
        eventBus.$emit("chatMessage", `Cannot send messages to channel "${channelName}".`)
      } else if (!message) {
        eventBus.$emit("newContext", `/g "${channel.name}"`)
      } else {
        channel.sendMessage(message)
      }
    } else {
      eventBus.$emit("chatMessage", `Unknown channel "${channelName}" or channel cannot receive messages.`)
    }
  }
}

const help_command = {
  name: "help",
  triggers: ["help"],
  description: "Show a list of commands. Example: /help",
  init: function() {
    //
  },
  handler: function(inputText) {
    let output = "Chat Commands:<br />"
    for (let i = 0; i < commandList.length; i++) {
      output += commandList[i].name + " - " + commandList[i].description + "<br />"
    }
    eventBus.$emit("chatMessage", output)
  }
}

const commandList = [
  tell_command,
  org_command,
  cc_command,
  reply_command,
  invite_command,
  kick_command,
  kick_all_command,
  leave_command,
  join_command,
  private_channel_message_command,
  help_command
]

commandList.forEach(x => x.init())

export default commandList