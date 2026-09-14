import {S, s, I, G} from './types'

export class LoginRequest {
  static id = 2
  static types = [I, S, S]

  constructor(unknown, username, key) {
    this.unknown = unknown
    this.username = username
    this.key = key

    this.args = [this.unknown, this.username, this.key]
  }
}

export class LoginSelect {
  static id = 3
  static types = [I]

  constructor(charId) {
    this.charId = charId

    this.args = [this.charId]
  }
}

export class CharacterLookup {
  static id = 21
  static types = [S]

  constructor(name) {
    this.name = name

    this.args = [this.name]
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

export class BuddyAdd {
  static id = 40
  static types = [I, S]

  constructor(charId, status) {
    this.charId = charId
    this.status = status

    this.args = [this.charId, this.status]
  }
}

export class BuddyRemove {
  static id = 41
  static types = [I]

  constructor(charId) {
    this.charId = charId

    this.args = [this.charId]
  }
}

export class PrivateChannelInvite {
  static id = 50
  static types = [I]

  constructor(charId) {
    this.charId = charId

    this.args = [this.charId]
  }
}

export class PrivateChannelKick {
  static id = 51
  static types = [I]

  constructor(charId) {
    this.charId = charId

    this.args = [this.charId]
  }
}

export class PrivateChannelJoin {
  static id = 52
  static types = [I]

  constructor(privateChannelId) {
    this.privateChannelId = privateChannelId

    this.args = [this.privateChannelId]
  }
}

export class PrivateChannelLeave {
  static id = 53
  static types = [I]

  constructor(privateChannelId) {
    this.privateChannelId = privateChannelId

    this.args = [this.privateChannelId]
  }
}

export class PrivateChannelKickAll {
  static id = 54
  static types = []

  constructor() {
    this.args = []
  }
}

export class PrivateChannelMessage {
  static id = 57
  static types = [I, S, S]

  constructor(privateChannelId, message, blob) {
    this.privateChannelId = privateChannelId
    this.message = message
    this.blob = blob

    this.args = [this.privateChannelId, this.message, this.blob]
  }
}

export class PublicChannelMessage {
  static id = 65
  static types = [G, S, S]

  constructor(channelId, message, blob) {
    this.channelId = channelId
    this.message = message
    this.blob = blob

    this.args = [this.channelId, this.message, this.blob]
  }
}

export class Ping {
  static id = 100
  static types = [S]

  constructor(blob) {
    this.blob = blob

    this.args = [this.blob]
  }
}

export class ChatCommand {
  static id = 120
  static types = [s, I]

  constructor(commands, windowId) {
    this.commands = commands
    this.windowId = windowId

    this.args = [this.commands, this.windowId]
  }
}

export const clientPacketList = [
  LoginRequest,
  LoginSelect,
  CharacterLookup,
  PrivateMessage,
  BuddyAdd,
  BuddyRemove,
  PrivateChannelInvite,
  PrivateChannelKick,
  PrivateChannelJoin,
  PrivateChannelLeave,
  PrivateChannelKickAll,
  PrivateChannelMessage,
  PublicChannelMessage,
  Ping,
  ChatCommand,
].reduce(function(map, obj) {
  map.set(obj.id, obj);
  return map;
}, new Map());
