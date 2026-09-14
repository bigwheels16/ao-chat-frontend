import Vue from 'vue'


export const eventBus = new Vue()

eventBus.$sendPacket = function(packet) {
  eventBus.$emit("outgoing[" + packet.constructor.id + "]", packet)
}

eventBus.$receivePacket = function(packetId, func) {
  if (!Number.isInteger(packetId)) {
    console.error("Tried to register value for packet listening that is not a packet id")
  }
  eventBus.$on("incoming[" + packetId + "]", func)
}