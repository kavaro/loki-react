import React from 'react'
import test from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { useDB, DB, DBProvider, ContextRegistry, DEFAULT_DB } from '../..'

test('should return object with default db instance of provider', t => {
  const registry = new ContextRegistry()
  const db = new DB({ registry })
  const wrapper = ({ children }) => <DBProvider db={db} registry={registry}>{children}</DBProvider>
  const { result } = renderHook(() => useDB(undefined, registry), { wrapper })
  t.is(result.current.db, db)
  t.is(result.current.db.filename, DEFAULT_DB)
})

test('should return object with db instance of provider', t => {
  const db = new DB('useDB1')
  const wrapper = ({ children }) => <DBProvider db={db}>{children}</DBProvider>
  const { result } = renderHook(() => useDB('useDB1'), { wrapper })
  t.is(result.current.db, db)
  t.is(result.current.db.filename, 'useDB1')
})

