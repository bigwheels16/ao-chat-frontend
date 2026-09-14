export function toBuffer(packet) {
  const types = packet.constructor.types
  const args = packet.args

  let buffers = []
  let size = 0
  for (let i = 0; i < types.length; i++) {
    const packed = types[i].pack(args[i])
    size += packed.length
    buffers.push(packed)
  }

  const b = Buffer.alloc(4)
  b.writeInt16BE(packet.constructor.id, 0)
  b.writeInt16BE(size, 2)

  return Buffer.concat([b, ...buffers])
}

export function fromBuffer(packetMap, buffer) {
  const packetType = buffer.readInt16BE(0)
  const packetLength = buffer.readInt16BE(2)
  const payload = buffer.slice(4, 4 + packetLength)

  const packetTypeClass = packetMap.get(packetType)
  return [getInstance(packetTypeClass, payload), packetLength]
}

function getInstance(packetTypeClass, payload) {
  let args = []
  packetTypeClass.types.forEach( t => {
    const [data, offset] = t.unpack(payload)
    args.push(data)
    payload = payload.slice(offset)
  })
  return new packetTypeClass.prototype.constructor(...args)
}
