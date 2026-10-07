// App-wide events, with the $on/$off/$emit API of a Vue 2 instance: a handler's error is logged
// and the remaining handlers still run
class EventBus {
  constructor() {
    this.handlers = new Map()
  }

  $on(events, handler) {
    for (const event of [].concat(events)) {
      if (!this.handlers.has(event)) {
        this.handlers.set(event, [])
      }
      this.handlers.get(event).push(handler)
    }
  }

  $off(events, handler) {
    for (const event of [].concat(events)) {
      const handlers = this.handlers.get(event)
      if (handlers) {
        this.handlers.set(event, handler ? handlers.filter(h => h !== handler) : [])
      }
    }
  }

  $emit(event, ...args) {
    for (const handler of [...(this.handlers.get(event) || [])]) {
      try {
        const result = handler.apply(this, args)
        if (result instanceof Promise) {
          result.catch(e => console.error(`Error in handler for "${event}"`, e))
        }
      } catch (e) {
        console.error(`Error in handler for "${event}"`, e)
      }
    }
  }

  $sendPacket(packet) {
    this.$emit("outgoing[" + packet.constructor.id + "]", packet)
  }

  $receivePacket(packetId, func) {
    if (!Number.isInteger(packetId)) {
      console.error("Tried to register value for packet listening that is not a packet id")
    }
    this.$on("incoming[" + packetId + "]", func)
  }
}

export const eventBus = new EventBus()
