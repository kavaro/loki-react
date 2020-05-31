import React from 'react'
import test from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { getDoc, DB, DBProvider, useDoc } from '../..'
import { TDoc } from '../types'

test('getDoc: should return null when collection does not exist', t => {
  t.is(getDoc(null, '$loki', 1), null)
})

test('getDoc: should return null when doc does not exist and options.create is not defined', t => {
  const db = new DB('getDoc1')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  t.is(getDoc(c1, '$loki', 1), null)
})

test('getDoc: should return doc returned from options.create when collection exists and doc does not exist', t => {
  const db = new DB('getDoc2')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  t.deepEqual(getDoc(c1, '$loki', 1, () => ({ name: 'n1' })), { $loki: 1, name: 'n1' })
})

test('getDoc: should return doc when it exists', t => {
  const db = new DB('getDoc3')
  const c1 = db.addCollection<TDoc>('c1', { disableMeta: true, disableFreeze: false, unique: ['id'] })
  c1.insert({ id: 'id1', name: 'n' })
  t.deepEqual(getDoc<TDoc>(c1, '$loki', 1), { $loki: 1, id: 'id1', name: 'n' })
  t.deepEqual(getDoc<TDoc>(c1, 'id', 'id1'), { $loki: 1, id: 'id1', name: 'n' })
})

test('should return null when doc does not exist', t => {
  const db = new DB('useDoc1')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useDoc('c1', 1, { dbName: 'useDoc1' }), { wrapper })
  t.is(result.current[0], null)
  t.is(result.current[1], null)
})

test('should return collection when collection was not a string', t => {
  const db = new DB('useDoc2')
  const c1 = db.addCollection<TDoc>('c1', { disableMeta: true, disableFreeze: false, unique: ['id'] })
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useDoc(c1, 1, { dbName: 'useDoc2' }), { wrapper })
  t.is(result.current[1], c1)
})

test('should not subscribe when subscribe is false', t => {
  const db = new DB('useDoc3')
  const c1 = db.addCollection<TDoc>('c1', { disableMeta: true, disableFreeze: false })
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(() => useDoc('c1', 1, { dbName: 'useDoc3', subscribe: false }), { wrapper })
  t.is(result.current[0], null)
  t.is(result.current[1], c1)
  c1.insert({ name: 'n1' })
  rerender()
  t.is(result.current[0], null)
  t.is(result.current[1], c1)
})

test('should subscribe when collection is created', t => {
  const db = new DB('useDoc4')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook((id) => useDoc('c1', id, { dbName: 'useDoc4' }), { wrapper, initialProps: 1 })
  t.is(result.current[0], null)
  t.is(result.current[1], null)
  const c1 = db.addCollection<TDoc>('c1', { disableMeta: true, disableFreeze: false })
  rerender(1)
  t.is(result.current[0], null)
  t.is(result.current[1], c1)
  c1.insert({ name: 'n1' })
  rerender(1)
  t.deepEqual(result.current[0], { $loki: 1, name: 'n1' })
  t.is(result.current[1], c1)
  rerender(2)
  t.deepEqual(result.current[0], null)
  t.is(result.current[1], c1)
  c1.insert([{ name: 'n2' }, { name: 'n3' }])
  rerender(2)
  t.deepEqual(result.current[0], { $loki: 2, name: 'n2' })
  t.is(result.current[1], c1)
  c1.remove(1)
  rerender(2)
  t.deepEqual(result.current[0], { $loki: 2, name: 'n2' })
  t.is(result.current[1], c1)
  c1.remove(2)
  t.deepEqual(result.current[0], null)
  t.is(result.current[1], c1)
  c1.update([{ $loki: 3, name: 'n33' }])
  rerender(2)
  t.deepEqual(result.current[0], null)
  t.is(result.current[1], c1)
  c1.insert([{ name: 'n4' }])
  rerender(2)
  t.deepEqual(result.current[0], null)
  t.is(result.current[1], c1)
})
