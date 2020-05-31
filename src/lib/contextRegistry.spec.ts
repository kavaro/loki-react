import test from 'ava'
import { createContext } from 'react'
import { contextRegistry, ContextRegistry, TDB } from '..'

test('register: should store the database context', t => {
  const registry = new ContextRegistry()
  const context1 = createContext({ db: {} as unknown as TDB })
  const context2 = createContext({ db: {} as unknown as TDB })
  registry.register('c1', context1)
  t.is(registry.get('c1'), context1)
  registry.register('c2', context2)
  t.is(registry.get('c2'), context2)
})

test('register: should throw when context with the same name was already registered', t => {
  const registry = new ContextRegistry()
  const context1 = createContext({ db: {} as unknown as TDB })
  const context2 = createContext({ db: {} as unknown as TDB })
  registry.register('c1', context1)
  t.is(registry.get('c1'), context1)
  t.throws(() => registry.register('c1', context2))
})

test('get: should throw when context has not been registered', t => {
  const registry = new ContextRegistry()
  t.throws(() => registry.get('c1'))
})

test('should have default export with ContextRegistry instance', t => {
  t.assert(contextRegistry instanceof ContextRegistry)
})