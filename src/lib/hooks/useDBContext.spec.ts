import test from 'ava'
import sinon from 'sinon'
import { createContext } from 'react'
import { EventEmitter } from 'events'
import isPlainObject from 'is-plain-object'
import { renderHook, act } from '@testing-library/react-hooks'
import { useDBContext, contextRegistry, TDB } from '../..'

class DBStub extends EventEmitter {
  public filename: string

  constructor(filename: string) {
    super()
    this.filename = filename
    contextRegistry.register(filename, createContext({ db: this as unknown as TDB }))
  }
}

test('returns object with db and React Context', t => {
  const db: TDB = new DBStub('useDBContext1') as unknown as TDB
  const { result } = renderHook(() => useDBContext(db))
  const [value, Context] = result.current
  t.is(isPlainObject(value), true)
  t.deepEqual(Object.keys(value), ['db'])
  t.is(value.db, db)
  t.is(Context, contextRegistry.get('useDBContext1'))
})

test('returns new object with db and same React Context after "loaded" event is emitted by db', t => {
  const db: TDB = new DBStub('useDBContext2') as unknown as TDB
  const { result } = renderHook(() => useDBContext(db))
  const [prvValue, prvContext] = result.current
  t.is(prvValue.db, db)
  t.is(prvContext, contextRegistry.get('useDBContext2'))
  act(() => {
    db.emit('loaded')
  })
  const [nxtValue, nxtContext] = result.current
  t.assert(nxtValue !== prvValue)
  t.is(nxtValue.db, db)
  t.is(nxtContext, prvContext)
})

test('should remove and add listener when db changes', t => {
  const db1: TDB = new DBStub('useDBContext3') as unknown as TDB
  const db2: TDB = new DBStub('useDBContext4') as unknown as TDB
  const addListener1 = sinon.spy(db1, 'addListener')
  const removeListener1 = sinon.spy(db1, 'removeListener')
  const addListener2 = sinon.spy(db2, 'addListener')
  const removeListener2 = sinon.spy(db2, 'removeListener')
  const { rerender } = renderHook(
    (db) => useDBContext(db),
    {
      initialProps: db1
    })
  t.assert(addListener1.calledOnce)
  t.assert(removeListener1.notCalled)
  rerender(db2)
  t.assert(removeListener1.calledOnce)
  t.assert(addListener2.calledOnce)
  t.assert(removeListener2.notCalled)
})
