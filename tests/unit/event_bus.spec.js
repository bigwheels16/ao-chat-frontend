import { describe, it, expect, vi, afterEach } from 'vitest'
import { eventBus } from '@/lib/core/event_bus'

// The bus is shared by the whole app, so each test uses its own event names
describe('eventBus', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('passes every argument to each handler', () => {
    const handler = vi.fn()
    eventBus.$on('args', handler)
    eventBus.$emit('args', 1, 'two', { three: 3 })
    expect(handler).toHaveBeenCalledWith(1, 'two', { three: 3 })
  })

  it('registers and removes a handler for several events at once', () => {
    const handler = vi.fn()
    eventBus.$on(['multi-a', 'multi-b'], handler)
    eventBus.$emit('multi-a', 'a')
    eventBus.$emit('multi-b', 'b')
    expect(handler.mock.calls).toEqual([['a'], ['b']])

    eventBus.$off(['multi-a', 'multi-b'], handler)
    eventBus.$emit('multi-a')
    eventBus.$emit('multi-b')
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('removes only the given handler, or all of them when none is given', () => {
    const first = vi.fn()
    const second = vi.fn()
    eventBus.$on('off', first)
    eventBus.$on('off', second)
    eventBus.$off('off', first)
    eventBus.$emit('off')
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)

    eventBus.$off('off')
    eventBus.$emit('off')
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('logs a failing handler and still runs the rest', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const after = vi.fn()
    eventBus.$on('failing', () => { throw new Error('sync failure') })
    eventBus.$on('failing', () => Promise.reject(new Error('async failure')))
    eventBus.$on('failing', after)

    eventBus.$emit('failing')
    await new Promise(resolve => setTimeout(resolve))

    expect(after).toHaveBeenCalledTimes(1)
    expect(error.mock.calls.map(call => call[1].message)).toEqual(['sync failure', 'async failure'])
  })

  it('runs every handler registered when the event was emitted, even if one removes another', () => {
    const second = vi.fn()
    eventBus.$on('remove-during-emit', () => eventBus.$off('remove-during-emit', second))
    eventBus.$on('remove-during-emit', second)
    eventBus.$emit('remove-during-emit')
    expect(second).toHaveBeenCalledTimes(1)
    eventBus.$emit('remove-during-emit')
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('does not run a handler added while the event is being emitted until the next emit', () => {
    const added = vi.fn()
    eventBus.$on('add-during-emit', () => eventBus.$on('add-during-emit', added))
    eventBus.$emit('add-during-emit')
    expect(added).not.toHaveBeenCalled()
    eventBus.$emit('add-during-emit')
    expect(added).toHaveBeenCalledTimes(1)
  })

  it('routes packets by their id', () => {
    class TestPacket {
      static id = 4242
    }
    const outgoing = vi.fn()
    const incoming = vi.fn()
    eventBus.$on('outgoing[4242]', outgoing)
    eventBus.$receivePacket(4242, incoming)

    const packet = new TestPacket()
    eventBus.$sendPacket(packet)
    eventBus.$emit('incoming[4242]', packet)

    expect(outgoing).toHaveBeenCalledWith(packet)
    expect(incoming).toHaveBeenCalledWith(packet)
  })
})
