// taken from: https://github.com/Nepherius/Darknet/blob/812e2d7ca9b22f7bbe3d72000d45c8ee60db806e/system/core/pack.js

export const S = {
  pack: function(data) {
    const b = Buffer.alloc(2)
    b.writeInt16BE(data.length, 0)
    return Buffer.concat([b, Buffer.from(data)])
  },
  
  unpack: function(buffer) {
    const len = buffer.readInt16BE(0)
    let offset = 2
    const data = buffer.slice(offset, offset + len).toString()
    offset += len
    return [data, offset]
  }
}

export const s = {
  pack: function(data) {
    const b = Buffer.alloc(2)
    b.writeInt16BE(data.length, 0)

    const buffers = []
    for (let i = 0; i < data.length; i++) {
      buffers.push(S.pack(data[i]))
    }

    return Buffer.concat([b, ...buffers])
  },

  unpack: function(buffer) {
    const len = buffer.readInt16BE(0)
    let offset = 2

    const items = []
    for (let i = 0; i < len; i++) {
      const [data, newOffset] = S.unpack(buffer.slice(offset))
      offset += newOffset
      items.push(data.toString())
    }

    return [items, offset]
  }
}

export const I = {
  size: 4,

  pack: function(data) {
    const b = Buffer.alloc(this.size)
    b.writeUInt32BE(data, 0)
    return b
  },

  unpack: function(buffer) {
    return [buffer.readInt32BE(0), this.size]
  }
}

export const i = {
  pack: function(data) {
    const b = Buffer.alloc(2)
    b.writeInt16BE(data.length, 0)

    const buffers = []
    for (let i = 0; i < data.length; i++) {
      buffers.push(I.pack(data[i]))
    }

    return Buffer.concat([b, ...buffers])
  },

  unpack: function(buffer) {
    const len = buffer.readInt16BE(0)
    let offset = 2

    const items = []
    for (let i = 0; i < len; i++) {
      const [data, newOffset] = I.unpack(buffer.slice(offset))
      offset += newOffset
      items.push(data)
    }

    return [items, offset]
  }
}

export const B = {
  pack: function(data) {
    const b = Buffer.alloc(2)
    b.writeInt16BE(data.length, 0)
    return Buffer.concat([b, Buffer.from(data)])
  },

  unpack: function(buffer) {
    const len = buffer.readInt16BE(0)
    let offset = 2
    const data = buffer.slice(offset, offset + len)
    offset += len
    return [data, offset]
  }
}

// taken from: https://stackoverflow.com/a/29639207/280574
export const G = {
  size: 5,

  pack: function(data) {
    Buffer.from
    const b = Buffer.alloc(this.size)
    b.writeUIntBE(data, 0, this.size)
    return b
  },

  unpack: function(buffer) {
    return [buffer.readUIntBE(0, this.size), this.size]
  }
}