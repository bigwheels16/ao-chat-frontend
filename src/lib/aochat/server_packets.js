import {S, s, I, i, B, G} from './types'

export class LoginSeed {
  static id = 0
  static types = [S]

  constructor(seed) {
    this.seed = seed

    this.args = [this.seed]
  }
}

export class LoginOK {
  static id = 5
  static types = []

  constructor() {
    this.args = []
  }
}

export class LoginError {
  static id = 6
  static types = [S]

  constructor(message) {
    this.message = message

    this.args = [this.message]
  }
}

export class LoginCharacterList {
  static id = 7
  static types = [i, s, i, i]

  constructor(charIds, names, levels, onlineStatuses) {
    this.charIds = charIds
    this.names = names
    this.levels = levels
    this.onlineStatuses = onlineStatuses

    this.args = [this.charIds, this.names, this.levels, this.onlineStatuses]
  }
}

export class LoginCharacterUnknown {
  static id = 10
  static types = [I]

  constructor(charId) {
    this.charId = charId

    this.args = [this.charId]
  }
}

export class CharacterName {
  static id = 20
  static types = [I, S]

  constructor(charId, name) {
    this.charId = charId
    this.name = name

    this.args = [this.charId, this.name]
  }
}

export class CharacterLookup {
  static id = 21
  static types = [I, S]

  constructor(charId, name) {
    this.charId = charId
    this.name = name

    this.args = [this.charId, this.name]
  }
}

export class PrivateMessage {
  static id = 30
  static types = [I, S, S]

  constructor(charId, message, blob) {
    this.charId = charId
    this.message = message
    this.blob = blob

    this.args = [this.charId, this.message, this.blob]
  }
}

export class VicinityMessage {
  static id = 34
  static types = [I, S, S]

  constructor(charId, message, blob) {
    this.charId = charId
    this.message = message
    this.blob = blob

    this.args = [this.charId, this.message, this.blob]
  }
}

export class BroadcastMessage {
  static id = 35
  static types = [S, S, S]

  constructor(text, message, blob) {
    this.text = text
    this.message = message
    this.blob = blob

    this.args = [this.text, this.message, this.blob]
  }
}

export class SimpleSystemMessage {
  static id = 36
  static types = [S]

  constructor(message) {
    this.message = message

    this.args = [this.message]
  }
}

export class SystemMessage {
  static id = 37
  static types = [I, I, I, B]

  constructor(clientId, windowId, messageId, messageArgs) {
    this.clientId = clientId
    this.windowId = windowId
    this.messageId = messageId
    this.messageArgs = messageArgs

    this.args = [this.clientId, this.windowId, this.messageId, this.messageArgs]
  }
}

export class BuddyAdded {
  static id = 40
  static types = [I, I, S]

  constructor(charId, online, status) {
    this.charId = charId
    this.online = online
    this.status = status

    this.args = [this.charId, this.online, this.status]
  }
}

export class BuddyRemoved {
  static id = 41
  static types = [I]

  constructor(charId) {
    this.charId = charId

    this.args = [this.charId]
  }
}

export class PrivateChannelInvited {
  static id = 50
  static types = [I]

  constructor(privateChannelId) {
    this.privateChannelId = privateChannelId

    this.args = [this.privateChannelId]
  }
}

export class PrivateChannelKicked {
  static id = 51
  static types = [I]

  constructor(privateChannelId) {
    this.privateChannelId = privateChannelId

    this.args = [this.privateChannelId]
  }
}

export class PrivateChannelClientJoined {
  static id = 55
  static types = [I, I]

  constructor(privateChannelId, charId) {
    this.privateChannelId = privateChannelId
    this.charId = charId

    this.args = [this.privateChannelId, this.charId]
  }
}

export class PrivateChannelClientLeft {
  static id = 56
  static types = [I, I]

  constructor(privateChannelId, charId) {
    this.privateChannelId = privateChannelId
    this.charId = charId

    this.args = [this.privateChannelId, this.charId]
  }
}

export class PrivateChannelMessage {
  static id = 57
  static types = [I, I, S, S]

  constructor(privateChannelId, charId, message, blob) {
    this.privateChannelId = privateChannelId
    this.charId = charId
    this.message = message
    this.blob = blob

    this.args = [this.privateChannelId, this.charId, this.message, this.blob]
  }
}

export class PrivateChannelInviteRefused {
  static id = 58
  static types = [I, I]

  constructor(privateChannelId, charId) {
    this.privateChannelId = privateChannelId
    this.charId = charId

    this.args = [this.privateChannelId, this.charId]
  }
}

export class PublicChannelJoined {
  static id = 60
  static types = [G, S, I, S]

  constructor(channelId, name, unknown, flags) {
    this.channelId = channelId
    this.name = name
    this.unknown = unknown
    this.flags = flags

    this.args = [this.channelId, this.name, this.unknown, this.flags]
  }
}

export class PublicChannelLeft {
  static id = 61
  static types = [G]

  constructor(channelId) {
    this.channelId = channelId

    this.args = [this.channelId]
  }
}

export class PublicChannelMessage {
  static id = 65
  static types = [G, I, S, S]

  constructor(channelId, charId, message, blob) {
    this.channelId = channelId
    this.charId = charId
    this.message = message
    this.blob = blob

    this.args = [this.channelId, this.charId, this.message, this.blob]
  }
}

export class Pong {
  static id = 100
  static types = [S]

  constructor(blob) {
    this.blob = blob

    this.args = [this.blob]
  }
}

export const serverPacketList = [
  LoginSeed, 
  LoginOK,
  LoginError,
  LoginCharacterList,
  LoginCharacterUnknown,
  CharacterName,
  CharacterLookup,
  PrivateMessage,
  VicinityMessage,
  BroadcastMessage,
  SimpleSystemMessage,
  SystemMessage,
  BuddyAdded,
  BuddyRemoved,
  PrivateChannelInvited,
  PrivateChannelKicked,
  PrivateChannelClientJoined,
  PrivateChannelClientLeft,
  PrivateChannelMessage,
  PrivateChannelInviteRefused,
  PublicChannelJoined,
  PublicChannelLeft,
  PublicChannelMessage,
  Pong
].reduce(function(map, obj) {
  map.set(obj.id, obj);
  return map;
}, new Map());