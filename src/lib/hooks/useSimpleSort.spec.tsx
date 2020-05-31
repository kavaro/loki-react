import test from 'ava'
import sinon from 'sinon'
import { renderHook } from '@testing-library/react-hooks'
import { DB, useSimpleSort } from '../..'

test('should return simpleSort of dynamicView when it exists', t => {
  const db = new DB('useSimpleSort1')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  c1.insert([{ name: 'n1' }, { name: 'n2' }])
  const { result, rerender } = renderHook(({ dv }) => useSimpleSort(dv), { initialProps: { dv: null } })
  t.deepEqual(result.current, { field: '', desc: false })
  const dv1 = c1.addDynamicView('dv1')
  const addListenerSpy = sinon.spy(dv1, 'addListener')
  const removeListenerSpy = sinon.spy(dv1, 'removeListener')
  rerender({ dv: dv1 })
  t.deepEqual(result.current, {
    field: '',
    desc: false
  })
  t.assert(addListenerSpy.calledOnce)
  t.assert(removeListenerSpy.notCalled)
  dv1.applySimpleSort('name', false)
  rerender({ dv: dv1 })
  t.deepEqual(result.current, {
    field: 'name',
    desc: false
  })
  dv1.applySimpleSort('name', true)
  rerender({ dv: dv1 })
  t.deepEqual(result.current, {
    field: 'name',
    desc: true
  })
  rerender({ dv: undefined })
  t.assert(removeListenerSpy.calledOnce)
})

test('should return simpleSort of dynamicView', t => {
  const db = new DB('useSimpleSort2')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  c1.insert([{ name: 'n1' }, { name: 'n2' }])
  const dv1 = c1.addDynamicView('dv1')
  dv1.applySimpleSort('name', true)
  const { result } = renderHook(() => useSimpleSort(dv1))
  t.deepEqual(result.current, { field: 'name', desc: true })
})
