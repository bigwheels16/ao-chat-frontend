import { generate_login_key } from '@/lib/aochat/aocrypt'

// Expected keys come from the original implementation, which used Node's crypto.randomBytes,
// given the same "random" bytes
const cases = [
  ['5a1d2f3e4b5c6d7e', 'someuser', 'hunter2',
    'eb07f04b94111289681a822554ac1e337e6de74913c4b5869b33ca2fc7d59813cf0bb9953441d3eecdabb1e20c543cf43753c1f5f49c5e319048afc738b1da12e180c1103fad81e112beaad7288fe2f63679b23bf24d01c9fe1101230815dd22d12f392be6df0cae27f17cc27b36cb8d577cd6fee532ed7571f6507845291588-73dfa1e288ccda9e6ac0a167e1cccac8e96ee2f1335d944bb9e9c8e02377cf84b6fa1a616e5c2384f017b32313088a15'],
  ['0011223344556677', 'Another_User', 'p@ss w0rd!',
    'eb07f04b94111289681a822554ac1e337e6de74913c4b5869b33ca2fc7d59813cf0bb9953441d3eecdabb1e20c543cf43753c1f5f49c5e319048afc738b1da12e180c1103fad81e112beaad7288fe2f63679b23bf24d01c9fe1101230815dd22d12f392be6df0cae27f17cc27b36cb8d577cd6fee532ed7571f6507845291588-73dfa1e288ccda9e9bd0e81b721557eb59638cf87a90cfda7f69a7f94c00b4154da3eac8427f970eb643a75e035e0080cd17f878cf2bce1a'],
]

describe('generate_login_key', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  let counter

  beforeEach(() => {
    counter = 0
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { getRandomValues: array => array.map(() => (counter++ * 37 + 11) & 0xff) },
    })
  })

  afterEach(() => {
    if (original) {
      Object.defineProperty(globalThis, 'crypto', original)
    } else {
      delete globalThis.crypto
    }
  })

  it.each(cases)('matches the original implementation (seed %s, user %s)', (seed, user, pass, expected) => {
    expect(generate_login_key(seed, user, pass)).toBe(expected)
  })

  it('uses fresh random bytes for each key', () => {
    const [seed, user, pass] = cases[0]
    expect(generate_login_key(seed, user, pass)).not.toBe(generate_login_key(seed, user, pass))
  })
})
