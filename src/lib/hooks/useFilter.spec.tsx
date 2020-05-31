import React from 'react'
import test from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { DB, DBProvider, useFilter } from '../..'

test('should return filter if dynamicView and filter exist', t => {
  const db = new DB('useFilter1')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  const dv1 = c1.addDynamicView('dv1')
  dv1.applyFind({ name: 'n1' }, 'f1')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useFilter(dv1, 'f1'), { wrapper })
  const [filter0] = result.current
  t.deepEqual(filter0, { name: 'n1' })
})

test('should return filter and setFilter function', t => {
  const db = new DB('useFilter2')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  c1.insert([{ name: 'n1' }, { name: 'n2' }])
  const dv1 = c1.addDynamicView('dv1')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(({ dynamicView, name }) => useFilter(dynamicView, name),
    {
      wrapper,
      initialProps: {
        dynamicView: null,
        name: 'f1'
      }
    }
  )
  const [filter0, setFilter0] = result.current
  t.is(filter0, undefined)
  t.is(typeof setFilter0, 'function')
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])

  setFilter0({ name: 'n2' })
  rerender({ dynamicView: null, name: 'f1' })
  t.is(filter0, undefined)
  t.is(typeof setFilter0, 'function')
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])

  rerender({ dynamicView: dv1, name: 'f1' })
  const [filter1, setFilter1] = result.current
  t.is(filter1, undefined)
  t.assert(typeof setFilter1 === 'function')
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])

  const where = (doc: any) => doc.name === 'n2'
  setFilter1(where)
  rerender({ dynamicView: dv1, name: 'f1' })
  const [filter2, setFilter2] = result.current
  t.is(filter2, where)
  t.deepEqual(dv1.data(), [{ $loki: 2, name: 'n2' }])
  
  setFilter2()
  rerender({ dynamicView: dv1, name: 'f1' })
  const [,setFilter3] = result.current
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])

  setFilter3({ name: 'n2' })
  rerender({ dynamicView: dv1, name: 'f1' })
  const [filter4, setFilter4] = result.current
  t.deepEqual(filter4, { name: 'n2' })
  t.deepEqual(dv1.data(), [{ $loki: 2, name: 'n2' }])

  setFilter4()
  rerender({ dynamicView: dv1, name: 'f1' })
  const [,setFilter5] = result.current
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])

  setFilter5()
  rerender({ dynamicView: dv1, name: 'f1' })
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])

  rerender({ dynamicView: null, name: 'f1' })
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
})
