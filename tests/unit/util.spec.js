import { describe, it, expect } from 'vitest'
import { connectUrl, serverListUrl, format } from '../../src/lib/util'

describe('connectUrl', () => {
  it('appends the server id to the base path', () => {
    expect(connectUrl('wss://aochat-api.jkbff.com/connect', 'rk2019')).toBe('wss://aochat-api.jkbff.com/connect/rk2019')
    expect(connectUrl('ws://localhost:7777/connect/', 'rk5')).toBe('ws://localhost:7777/connect/rk5')
    expect(connectUrl('ws://localhost:7777', 'rk5')).toBe('ws://localhost:7777/rk5')
  })

  it('keeps the query string', () => {
    expect(connectUrl('wss://example.com/connect?debug=1', 'rk5')).toBe('wss://example.com/connect/rk5?debug=1')
  })

  it('rejects URLs that are not WebSocket URLs', () => {
    expect(() => connectUrl('not a url', 'rk5')).toThrow()
    expect(() => connectUrl('https://example.com/connect', 'rk5')).toThrow()
  })
})

describe('serverListUrl', () => {
  it('is the base URL over HTTP(S)', () => {
    expect(serverListUrl('wss://aochat-api.jkbff.com/connect')).toBe('https://aochat-api.jkbff.com/connect')
    expect(serverListUrl('ws://localhost:7777/connect/')).toBe('http://localhost:7777/connect')
  })

  it('rejects URLs that are not WebSocket URLs', () => {
    expect(() => serverListUrl('https://example.com/connect')).toThrow()
  })
})

describe('format', () => {
  // Expected strings come from the browser build of Node's util.format, which the app used before
  it.each([
    [['https://auno.org/ao/db.php?id=%d&ql=%d', '246660', '300'], 'https://auno.org/ao/db.php?id=246660&ql=300'],
    [['Unknown message (category %d, instance %d):', 20000, 158601204, 'Testchar', 42],
      'Unknown message (category 20000, instance 158601204): Testchar 42'],
    [['Your tower %s at X:%d and Z:%d in %s was just destroyed!', 'Control Tower', 1234, '567', 'Galway'],
      'Your tower Control Tower at X:1234 and Z:567 in Galway was just destroyed!'],
    [['%s has %d%% done', 'Bob', 50], 'Bob has 50% done'],
    [['Missing %s and %d', 'one'], 'Missing one and %d'],
    [['Not a number: %d', 'abc'], 'Not a number: NaN'],
    [['No specifiers', 'extra', 7], 'No specifiers extra 7'],
    [['%j and %s', 'x', 3], '"x" and 3'],
    [['Percent %x stays, %s', 'filled'], 'Percent %x stays, filled'],
    [['Level %u reached', 5], 'Level %u reached 5'],
  ])('formats %j', (args, expected) => {
    expect(format(...args)).toBe(expected)
  })
})
