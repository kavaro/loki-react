import React from 'react'
import test from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { regExp2string, string2regExp, filter2input, input2filter, DB, DBProvider, useFilterInput } from '../..'

test('regExp2string: should convert regexp to string', t => {
  t.is(regExp2string(/abc/i, '', ''), 'abc')
  t.is(regExp2string(/preabcpost/, 'pre', 'post'), 'abc')
})

test('string2regExp: should convert string to regexp', t => {
  const r1 = string2regExp('abc', '', '', false)
  t.assert(r1 instanceof RegExp)
  t.is(r1.toString(), '/abc/')

  const r2 = string2regExp('abc', 'pre', 'post', true)
  t.assert(r2 instanceof RegExp)
  t.is(r2.toString(), '/preabcpost/i')
})

test('filter2input: should return filter value at path', t => {
  t.is(filter2input({ a: { $regex: 'string' } }, 'a.$regex', 'regexp', '', ''), 'string')
  t.is(filter2input({ a: { $regex: /abc/i } }, 'a.$regex', 'regexp', '', ''), 'abc')
  t.is(filter2input({ a: { $regex: /abc/i } }, 'a.$regex', 'regexp', 'a', 'c'), 'b')
  t.is(filter2input({ a: 'string' }, 'a', 'number', '', ''), 'string')
  t.is(filter2input({ a: 10 }, 'a', 'number', '', ''), '10')
  t.is(filter2input({ a: 's' }, 'a', 'string', '', ''), 's')
})

test('input2filter: should set filter value at path using type', t => {
  const f1 = input2filter({}, 'a.$regex', 'regexp', 'karl', '^', '$', true)
  t.assert(f1.a.$regex instanceof RegExp)
  t.deepEqual(f1, { a: { $regex: /^karl$/i } })

  t.deepEqual(input2filter({}, 'a.b', 'number', '10', '', '', false), { a: { b: 10 } })

  t.deepEqual(input2filter({}, 'a.b', 'boolean', 'truthy', '', '', false), { a: { b: true } })
  t.deepEqual(input2filter({}, 'a.b', 'boolean', '', '', '', false), { a: { b: false } })

  t.deepEqual(input2filter({}, 'a.b', 'string', 's', '', '', false), { a: { b: 's' } })

  t.deepEqual(input2filter(undefined, 'a.b', 'string', 's', '', '', false), { a: { b: 's' } })
})

test('should return empty string when there is no filter', t => {
  const db = new DB('useFilterInput1')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  c1.insert([{ name: 'n1' }, { name: 'n2' }])
  const dv1 = c1.addDynamicView('dv1')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useFilterInput(dv1, 'f1', 'name.$regex', 'regexp'), { wrapper })
  const [input1, , error1] = result.current
  t.is(input1, '')
  t.is(error1, null)
})

test('should work with regex filter', t => {
  const db = new DB('useFilterInput2')
  const c1 = db.addCollection('c1', { disableMeta: true, disableFreeze: false })
  c1.insert([{ name: 'n1' }, { name: 'n2' }])
  const dv1 = c1.addDynamicView('dv1')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result, rerender } = renderHook(() => useFilterInput(dv1, 'f1', 'name.$regex', 'regexp'), { wrapper })
  const [input0, setInput0, error0] = result.current
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }, { $loki: 2, name: 'n2' }])
  t.is(input0, '')
  t.is(error0, null)
  setInput0('^n1')
  rerender()
  const [input1, setInput1, error1] = result.current
  t.deepEqual(dv1.data(), [{ $loki: 1, name: 'n1' }])
  t.is(input1, '^n1')
  t.is(error1, null)
  setInput1('^n2')
  rerender()
  const [input2, setInput2, error2] = result.current
  t.is(input2, '^n2')
  t.is(error2, null)
  t.deepEqual(dv1.data(), [{ $loki: 2, name: 'n2' }])
  setInput2({ target: { value: '^n[' } })
  rerender()
  const [input3, , error3] = result.current
  t.is(input3, '^n[')
  t.assert(error3 instanceof Error)
})