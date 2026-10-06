import { connectUrl, serverListUrl } from '../../src/lib/util'

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
