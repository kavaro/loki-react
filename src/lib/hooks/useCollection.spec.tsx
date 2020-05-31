import React from 'react'
import test from 'ava'
import sinon from 'sinon'
import { renderHook } from '@testing-library/react-hooks'
import Loki from 'lokijs'
import { ContextRegistry, DBProvider, DB, useCollection, getData, delay } from '../..'

test('getData: should return frozen collection docs array when collection has disableFreeze = false', t => {
  const registry = new ContextRegistry()
  const db = new DB('getData1', { registry, adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection', { disableMeta: true, disableFreeze: false })
  collection.insert([{ name: 'n1' }, { name: 'n2' }])
  const docs = getData(collection)
  t.deepEqual(docs, [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.assert(Object.isFrozen(docs))
})

test('getData: should return collection docs array when collection has disableFreeze = true', t => {
  const registry = new ContextRegistry()
  const db = new DB('getData2', { registry, adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection', { disableMeta: true })
  collection.insert([{ name: 'n1' }, { name: 'n2' }])
  const docs = getData(collection)
  t.deepEqual(docs, [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.assert(!Object.isFrozen(docs))
})

test('getData: should return empty array when collection does not exist', t => {
  const docs = getData(null)
  t.deepEqual(docs, [])
})

test('should return docs and collection', t => {
  const db = new DB('useCollection1')
  const collection = db.addCollection('c1', { disableFreeze: false, disableMeta: true })
  collection.insert([{ name: 'n1' }, { name: 'n2' }])
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useCollection('c1', { dbName: 'useCollection1' }), { wrapper })
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
})

test('should return empty array and null when collection does not exit', t => {
  const db = new DB('useCollection2')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useCollection('c2', { dbName: 'useCollection2' }), { wrapper })
  t.deepEqual(result.current[0], [])
  t.is(result.current[1], null)
})

test('should subscribe to changes and throttle change events', async t => {
  const db = new DB('useCollection3')
  const collection = db.addCollection('c1', { disableFreeze: false, disableMeta: true })
  collection.insert([{ name: 'n1' }, { name: 'n2' }])
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useCollection(collection, { dbName: 'useCollection3' }), { wrapper })
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  collection.insert({ name: 'n3' })
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }, { $loki: 3, name: 'n3' }])
  t.is(result.current[1], collection)
  collection.insert([{ name: 'n4' }, { name: 'n5' }])
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }, { $loki: 3, name: 'n3' }])
  t.is(result.current[1], collection)
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }, { $loki: 3, name: 'n3' }, { $loki: 4, name: 'n4' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  collection.update({ $loki: 2, name: 'n22' })
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }, { $loki: 3, name: 'n3' }, { $loki: 4, name: 'n4' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n22' }, { $loki: 3, name: 'n3' }, { $loki: 4, name: 'n4' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  collection.update([{ $loki: 3, name: 'n33' }, { $loki: 4, name: 'n44' }])
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n22' }, { $loki: 3, name: 'n3' }, { $loki: 4, name: 'n4' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n22' }, { $loki: 3, name: 'n33' }, { $loki: 4, name: 'n44' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  collection.remove(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n22' }, { $loki: 3, name: 'n33' }, { $loki: 4, name: 'n44' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 2, name: 'n22' }, { $loki: 3, name: 'n33' }, { $loki: 4, name: 'n44' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  collection.remove([2, 3])
  t.deepEqual(result.current[0], [{ $loki: 2, name: 'n22' }, { $loki: 3, name: 'n33' }, { $loki: 4, name: 'n44' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 4, name: 'n44' }, { $loki: 5, name: 'n5' }])
  t.is(result.current[1], collection)
})


test('should not subscribe to changes when subscribe option is false', async t => {
  const db = new DB('useCollection4')
  const collection = db.addCollection('c1', { disableFreeze: false, disableMeta: true })
  collection.insert([{ name: 'n1' }, { name: 'n2' }])
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useCollection('c1', { dbName: 'useCollection4', subscribe: false }), { wrapper })
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  collection.insert({ name: 'n3' })
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  collection.insert([{ name: 'n4' }, { name: 'n5' }])
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  collection.update({ $loki: 2, name: 'n22' })
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  collection.update([{ $loki: 3, name: 'n33' }, { $loki: 4, name: 'n44' }])
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  collection.remove(1)
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
  collection.remove([2, 3])
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(result.current[1], collection)
})

test('should resubscribe when collection changes or subscribe options changes', t => {
  const db = new DB('useCollection5')
  const c1 = db.addCollection('c1', { disableFreeze: false, disableMeta: true })
  c1.insert([{ name: 'n1' }, { name: 'n2' }])
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { rerender } = renderHook(({ name, subscribe }) => useCollection(name, { dbName: 'useCollection5', subscribe }), {
    wrapper, initialProps: { name: 'c1', subscribe: true }
  })
  const removeListenerSpy1 = sinon.spy(c1, 'removeListener')
  t.assert(removeListenerSpy1.notCalled)
  const c2 = db.addCollection('c2', { disableFreeze: false, disableMeta: true })
  const removeListenerSpy2 = sinon.spy(c2, 'removeListener')
  rerender({ name: 'c2', subscribe: true })
  t.is(removeListenerSpy1.callCount, 3)
  rerender({ name: 'c2', subscribe: false })
  t.is(removeListenerSpy2.callCount, 3)
  rerender({ name: 'c2', subscribe: true })
  t.is(removeListenerSpy2.callCount, 3)
})

test('should subscribe when collection is created', async t => {
  const db = new DB('useCollection6')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(() => useCollection('c1', { dbName: 'useCollection6' }), { wrapper })
  t.deepEqual(result.current[0], [])
  t.is(result.current[1], null)
  const c1 = db.addCollection('c1', { disableFreeze: false, disableMeta: true })
  rerender()
  t.deepEqual(result.current[0], [])
  t.is(result.current[1], c1)
  c1.insert({ name: 'n' })
  rerender()
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n' }])
  t.is(result.current[1], c1)
})

