import React, { FC, ReactElement, createContext } from 'react'
import test from 'ava'
import render from 'react-test-renderer'
import { EventEmitter } from 'events'
import { contextRegistry, useDB, DBProvider, TDB } from '..'

class DBStub extends EventEmitter {
  public filename: string

  constructor(filename: string) {
    super()
    this.filename = filename
    contextRegistry.register(filename, createContext({ db: this as unknown as TDB }))
  }
}

const DBFilename: FC<{ name: string }> = ({ name }): ReactElement => {
  const { db } = useDB(name)
  return (
    <div>
      {db ? db.filename : ''}
    </div>
  )
}

test('should provide react context', t => {
  const db: TDB = new DBStub('DBProvider1') as unknown as TDB
  const renderer = render.create(
    <DBProvider db={db}>
      <DBFilename name='DBProvider1' />
    </DBProvider>
  )
  const tree = renderer.toJSON()
  t.is(tree.type, 'div')
  t.deepEqual(tree.props, {})
  t.deepEqual(tree.children, ['DBProvider1'])
})