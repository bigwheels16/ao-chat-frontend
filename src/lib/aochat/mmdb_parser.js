import { split } from '@/lib/util'

// taken from: https://stackoverflow.com/a/54703169/280574
import mmdbText from 'raw-loader!@/assets/mmdb.txt';


class MMDBParser {
  constructor(entries) {
    const lines = entries.split("\r\n")

    this.mmdb = new Map()
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      if (!line || line.startsWith("#")) {
        continue
      }

      line = line.substring(1, line.length - 1)

      const [categoryId, instanceId, value] = split(line, ", ", 3)
      this.mmdb.set(categoryId + "." + instanceId, value.substring(1, value.length - 1))
    }
  }

  get = (categoryId, instanceId) => {
    return this.mmdb.get(categoryId + "." + instanceId)
  }

  parseParams = (buffer) => {
    const params = []
    for (let i = 0; i < buffer.length;) {
      const dataType = String.fromCharCode(buffer[i])
      i += 1

      switch (dataType) {
        case "S": {
          const size = buffer.readUInt16BE(i)
          i += 2

          const data = buffer.slice(i, i + size).toString()
          i += size

          params.push(data)
          break
        }

        case "s": {
          const size = buffer.readUInt8(i) - 1
          i += 1

          const data = buffer.slice(i, i + size).toString()
          i += size

          params.push(data)
          break
        }

        case "I": {
          const data = buffer.readUInt32BE(i)
          i += 4

          params.push(data)
          break
        }

        case "u":
        case "i": {
          const size = 5
          const data = this.readBase85(buffer.slice(i, i + size))
          i += size

          params.push(data)
          break
        }

        case "R": {
          const size = 5
          const categoryId = this.readBase85(buffer.slice(i, i + size))
          i += 5

          const instanceId = this.readBase85(buffer.slice(i, i + size))
          i += 5

          const data = this.get(categoryId, instanceId)

          params.push(data)
          break
        }

        case "l": {
          const categoryId = 20000
          const instanceId = buffer.readUInt32BE(i)
          i += 4

          const data = this.get(categoryId, instanceId)

          params.push(data)
          break
        }
      }
    }

    return params
  }

  readBase85 = (input) => {
    let n = 0
    for (let i = 0; i < 5; i++) {
        n = n * 85 + input.readUInt8(i) - 33
    }
    return n
  }
}

export const mmdbParser = new MMDBParser(mmdbText)
