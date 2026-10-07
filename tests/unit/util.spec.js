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
  ])('formats %j as before', (args, expected) => {
    expect(format(...args)).toBe(expected)
  })

  // Templates from the game's message database, which uses C printf placeholders
  it.each([
    [['You hit %s for %u points of damage.', 'Guard', 1234], 'You hit Guard for 1234 points of damage.'],
    [['You received a new mission with %i%% added richness (QL) to the treasures.', 15],
      'You received a new mission with 15% added richness (QL) to the treasures.'],
    [['Unable to perform action, able in %02d:%02d:%02d', 1, 5, 30], 'Unable to perform action, able in 01:05:30'],
    [['Locked down by Org leader: time until reset %02u:%02u:%02u', 12, 0, 9],
      'Locked down by Org leader: time until reset 12:00:09'],
    [['Mission chance of token reward upped to %0.0f%% due to your heroic effort.', 12.6],
      'Mission chance of token reward upped to 13% due to your heroic effort.'],
    [['Attack %.02fs', 1.5], 'Attack 1.50s'],
    [['Right hand weapon %s : %s : %d : %f', 'Pistol', 'Ranged', 3, 0.25], 'Right hand weapon Pistol : Ranged : 3 : 0.250000'],
    [['Offset %03d and [%4d]', -5, 7], 'Offset -05 and [   7]'],
    [['Haste 50% Speed, 100%. Done %S %s', 'now'], 'Haste 50% Speed, 100%. Done %S now'],
  ])('formats game message %j', (args, expected) => {
    expect(format(...args)).toBe(expected)
  })
})
