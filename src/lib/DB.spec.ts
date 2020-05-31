import test from 'ava'
import sinon from 'sinon'
import Loki from 'lokijs'
import { DB, DEFAULT_DB, TYPE_KEY, ContextRegistry, contextRegistry } from '..'

test('LokiOps: should be static member of DB', t => {
  t.is(typeof DB.LokiOps, 'object')
  t.is(typeof DB.LokiOps.$contains, 'function')
})

test('constructor: new DB() uses DEFAULT_DB as name and contextRegistry', t => {
  const db = new DB()
  t.assert(db instanceof Loki)
  t.is(db.filename, DEFAULT_DB)
  t.is(db.registry, contextRegistry)
})

test('constructor: new DB({ ...options }) uses DEFAULT_DB as database name', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB({ registry, adapter })
  t.assert(db instanceof Loki)
  t.is(db.filename, DEFAULT_DB)
  t.is(db.persistenceAdapter, adapter)
  t.is(db.registry, registry)
})

test('constructor: new DB("DB1") uses "DB1" as database name and default contextRegistry', t => {
  const db = new DB('DB1')
  t.assert(db instanceof Loki)
  t.is(db.filename, 'DB1')
  t.is(db.registry, contextRegistry)
})

test('constructor: new DB("DB2", { ...options }) uses "DB2" as database name', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB2', { adapter, registry})
  t.is(db.filename, 'DB2')
  t.is(db.persistenceAdapter, adapter)
  t.is(db.registry, registry)
})

test('constructor: sets autoloading, loaded, ready properties when autoload = false', async t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB3', { adapter, registry })
  t.is(db.autoloading, false)
  t.is(db.loaded, false)
  await db.ready
})

test('constructor: sets autoloading, loaded, ready properties when autoload = true', async t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB4', { adapter, autoload: true, registry })
  t.is(db.autoloading, true)
  t.is(db.loaded, false)
  await db.ready
  t.is(db.autoloading, false)
  t.is(db.loaded, true)
  db.emit('loaded')
  t.is(db.autoloading, false)
  t.is(db.loaded, true)
})

test('destroy: should remove database from registry', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB5', { adapter, registry })
  t.is(registry.has('DB5'), true)
  db.destroy()
  t.is(registry.has('DB5'), false)
})

test('get/add/ensureCollection: should get/add/ensure collection', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB6', { adapter, registry })
  t.is(db.getCollection('c1'), null)
  t.is(db.getCollection('c2'), null)
  const c1 = db.addCollection('c1')
  t.is(db.getCollection('c1'), c1)
  const c2 = db.ensureCollection('c2')
  t.is(db.getCollection('c2'), c2)
})

test('add/ensureCollection: should add/ensure collection with options', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB6', { adapter, registry })
  const c1 = db.addCollection('c1', { disableFreeze: false })
  t.is(c1.disableFreeze, false)
  const c2 = db.ensureCollection('c2', { disableFreeze: false })
  t.is(c2.disableFreeze, false)
})

test('serializeReplacer: should serialize RegExp', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB7', { adapter, registry })
  t.deepEqual(db.serializeReplacer('regexp', /abc/i), {
    [TYPE_KEY]: {
      type: 'RegExp',
      value: '/abc/i'
    }
  })
})

test('deserializeReviver: should deserialize a serialized RegExp', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB7', { adapter, registry })
  const regExp = db.deserializeReviver('', {
    [TYPE_KEY]: {
      type: 'RegExp',
      value: '/abc/i'
    }
  })
  t.assert(regExp instanceof RegExp)
  t.is(regExp.toString(), '/abc/i')
})

test('deserializeReviver: should return value when not a serialized RegExp', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB7', { adapter, registry })
  const value1 = { key: 'value' }
  t.is(db.deserializeReviver('', value1), value1)
  const value2 = { 
    [TYPE_KEY]: { 
      type: 'otherKey', 
      value: 'otherValue' 
    }
  }
  t.is(db.deserializeReviver('', value2), value2)
  const value3 = 'value3'
  t.is(db.deserializeReviver('', value3), value3)
})

test('loadJSON: calls deserializeReviver', t => {
  const registry = new ContextRegistry()
  const adapter = new Loki.LokiMemoryAdapter()
  const db = new DB('DB7', { adapter, registry })
  const deserializeReviverSpy = sinon.spy(db, 'deserializeReviver')
  const loadJSONObjectSpy = sinon.spy()
  db.loadJSONObject = loadJSONObjectSpy
  db.loadJSON(JSON.stringify({ a: 'b' }))
  t.is(deserializeReviverSpy.callCount, 2)
  t.assert(loadJSONObjectSpy.calledOnce)
  t.deepEqual(loadJSONObjectSpy.getCall(0).args[0], { a: 'b' })
})

test('serializableTypes.RegExp.deserialize: return value when it is not a string formatted as regexp', t => {
  t.is(DB.serializableTypes.RegExp.deserialize('abc'), 'abc')
  t.is(DB.serializableTypes.RegExp.deserialize('/abc'), '/abc')
})
