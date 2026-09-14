import { fromBuffer, toBuffer } from '../aochat/packets'
import { generate_login_key } from '../aochat/aocrypt'
import * as server_packets from '@/lib/aochat/server_packets'
import * as client_packets from '../aochat/client_packets'
import { eventBus } from '@/lib/core/event_bus'
import { capitalizeFirstLetter } from '@/lib/util'


class AOClient {
  constructor() {
    // https://www.youtube.com/watch?v=jzh4zQcfB0o&ab_channel=TheNetNinja
    this.connection = null
    this.connectionStatus = "disconnected"
    this.charIdToName = new Map()
    this.nameToCharId = new Map()
    this.publicChannels = new Map()
    this.orgChannel = null
    this.charId = null
    this.packetsSent = 0
    this.packetsReceived = 0
  }

  init = () => {
    const self = this

    client_packets.clientPacketList.forEach(function(value, key) {
      eventBus.$on("outgoing[" + key + "]", self.sendPacket)
    })

    eventBus.$on("outgoing[" + client_packets.LoginSelect.id + "]", function(packet) {
      self.charId = packet.charId
    })

    eventBus.$receivePacket(server_packets.PrivateMessage.id, function() {
      if (document.hidden || !document.hasFocus()) {
        if (!document.title.startsWith("* ")) {
          document.title = "* " + document.title
        }
      }
    })

    window.addEventListener("focus", function() {
      if (document.title.startsWith("* ")) {
        document.title = document.title.substring(2)
      }
    })
  }

  disconnect = () => {
    this.stopKeepAlive()
    if (this.connection) {
      this.connection.close()
    }
  }

  startKeepAlive = () => {
    this.stopKeepAlive()
    this.waitingForPacket = false

    this.pingTimer = setInterval(() => {
      if (this.waitingForPacket) {
        console.warn("Keepalive ping timeout: no packet received. Disconnecting.")
        this.disconnect()
        return
      }

      if (this.isConnected()) {
        this.waitingForPacket = true
        this.sendPacket(new client_packets.Ping("keepalive"))
      }
    }, 30000)
  }

  stopKeepAlive = () => {
    this.waitingForPacket = false
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  isConnected = () => {
    // https://stackoverflow.com/a/23369370/280574
    return this.connection && this.connection.readyState === WebSocket.OPEN
  }

  connect = (url, username, password) => {
    this.disconnect()
    this.packetsSent = 0
    this.packetsReceived = 0

    this.connection = new WebSocket(url)
    this.connection.binaryType = "arraybuffer";
    this.changeConnectionStatus("connecting")

    const self = this
    
    this.connection.onmessage = function(event) {
      self.waitingForPacket = false
      self.startKeepAlive()
      self.packetsReceived++

      const buffer = Buffer(event.data)
      const [packet, ] = fromBuffer(server_packets.serverPacketList, buffer)
      console.log("Receiving: ", packet)

      if (packet.constructor.id == server_packets.LoginSeed.id) {
        const result = generate_login_key(packet.seed, username, password)
        self.sendPacket(new client_packets.LoginRequest(0, username, result))
      } else if (packet.constructor.id == server_packets.CharacterName.id || packet.constructor.id == server_packets.CharacterLookup.id) {
        if (packet.charId != -1) {
          self.charIdToName.set(packet.charId, packet.name)
          self.nameToCharId.set(packet.name, packet.charId)
        }
      } else if (packet.constructor.id == server_packets.PublicChannelJoined.id) {
        self.publicChannels.set(packet.channelId, packet)

        // right shift 32 bits
        const b = Buffer.alloc(5)
        b.writeUIntBE(packet.channelId, 0, 5)
        const value = b.readUIntBE(0, 1)
        if (value == 3) {
          self.orgChannel = packet
        }
      }

      // } else if (packet.constructor.id == LoginError.id) {
      //   self.addMessage(packet.message)
      //   self.connection.close()
      // }

      eventBus.$emit("incoming[" + packet.constructor.id + "]", packet)
    }

    this.connection.onopen = function() {
      self.changeConnectionStatus("connected")
      self.startKeepAlive()
    }

    this.connection.onclose = function() {
      self.stopKeepAlive()
      self.changeConnectionStatus("disconnected")
    }

    this.connection.onerror = function() {
      self.stopKeepAlive()
      self.changeConnectionStatus("disconnected")
    }
  }

  changeConnectionStatus = (newConnectionStatus) => {
    const oldConnectionStatus = this.connectionStatus
    this.connectionStatus = newConnectionStatus
    eventBus.$emit("connectionStatusChanged", oldConnectionStatus, newConnectionStatus)
  }

  sendPacket = (packet) => {
    console.log("Sending: ", packet)
    this.packetsSent++
    const buf = toBuffer(packet)
    this.connection.send(buf)
  }

  getCharacterName = (charId) => {
    return this.charIdToName.get(charId) || charId
  }

  getChannelName = (channelId) => {
    const channel = this.publicChannels.get(channelId)
    
    if (channel) {
      return channel.name
    } else {
      return channelId
    }
  }

  getCharacterId = (name) => {
    let intTest = Number(name)
    if (intTest && Number.isInteger(intTest)) {
      return Promise.resolve(intTest)
    }

    name = capitalizeFirstLetter(name)

    const charId = this.nameToCharId.get(name)
    if (charId) {
      return Promise.resolve(charId)
    } else {
      return new Promise(function(resolve) {
        const eventTypes = ["incoming[" + server_packets.CharacterName.id + "]", "incoming[" + server_packets.CharacterLookup.id + "]"]
        const func = function(packet) {
          if (packet.name == name) {
            eventBus.$off(eventTypes, func)
            if (packet.charId == -1) {
              resolve(null)
            } else {
              resolve(packet.charId)
            }
          }
        }
        eventBus.$on(eventTypes, func)
        eventBus.$sendPacket(new client_packets.CharacterLookup(name))
      });
    }
  }

  getOrgChannel = () => {
    return this.orgChannel
  }

  getCharId = () => {
    return this.charId
  }
}

export const aoClient = new AOClient()
aoClient.init()
