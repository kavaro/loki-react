import React from 'react'
import test from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { DB, DBProvider, useDynamicView } from '../..'
import { delay } from '../DB'

test('should return empty data array, dynamicView = null and loading true when collection does not exist', t => {
  const db = new DB('useDynamicView1')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useDynamicView('c1', { dbName: 'useDynamicView1', subscribe: false }), { wrapper })
  t.deepEqual(result.current, [[], null, false])
})

test('should return dynamic view data, but not subscribe when options.subscribe is false', t => {
  const db = new DB('useDynamicView2')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  c1.insert({ name: 'n1' })
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(() => useDynamicView('c1', { dbName: 'useDynamicView2', subscribe: false }), { wrapper })
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }])
  t.assert(result.current[1] !== null)
  c1.insert({ name: 'n2' })
  rerender()
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }])
})

test('should return dynamic view data, but subscribe when options.subscribe is true or not set', async t => {
  const db = new DB('useDynamicView3')
  const c1 = db.addCollection('c1', { disableMeta: true })
  c1.insert({ name: 'n1' })
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(() => useDynamicView(c1, { dbName: 'useDynamicView3', name: 'dv1' }), { wrapper })
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }])
  t.assert(result.current[1].name === 'dv1')
  t.is(result.current[2], false)
  c1.insert({ name: 'n2' })
  rerender()
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }])
  await delay(1)
  t.deepEqual(result.current[0], [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
})

test('should re-subscribe to rebuild event when autoRemove is false', t => {
  const db = new DB('useDynamicView4')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(() => useDynamicView('c1', { dbName: 'useDynamicView4', subscribe: true, name: 'dv1' }), { wrapper })
  t.deepEqual(result.current, [[], c1.getDynamicView('dv1'), false])
  db.removeCollection('c1')
  rerender()
  t.deepEqual(result.current, [[], null, false])
})

test('should re-subscribe to rebuild event when autoRemove is true', t => {
  const db = new DB('useDynamicView5')
  db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(() => useDynamicView('c1', { dbName: 'useDynamicView5', subscribe: true }), { wrapper })
  t.deepEqual(result.current[0], [])
  t.assert(result.current[1] !== null)
  t.is(result.current[2], false)
  db.removeCollection('c1')
  rerender()
  t.deepEqual(result.current, [[], null, false])
})

test('should re-subscribe', t => {
  const db = new DB('useDynamicView6')
  const c1 = db.addCollection('c1', { disableMeta: true })
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(({ subscribe }) => useDynamicView('c1', { dbName: 'useDynamicView6', subscribe, name: 'dv1' }),
    { 
      wrapper,
      initialProps: {
        subscribe: false
      }
    }
  )
  t.deepEqual(result.current, [[], c1.getDynamicView('dv1'), false])
  db.removeCollection('c1')
  rerender({ subscribe: true })
  t.deepEqual(result.current, [[], null, false])
  rerender({ subscribe: false })
  t.deepEqual(result.current, [[], null, false])
})

