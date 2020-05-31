import test from 'ava'
import Loki from 'lokijs'
import './DBCollection'
import './DBDynamicView'
import { TDBCollection } from './types'

test('getFilterValue: returns filter value if it exists', t => {
  const db = new Loki('getFilterValue1', { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection') as TDBCollection<any>
  const dynamicView = collection.ensureDynamicView('view')
  t.is(dynamicView.getFilterValue('f1'), undefined)
  const query = {}
  dynamicView.applyFind(query, 'f1')
  const value = dynamicView.getFilterValue('f1')
  t.is(value, query)
})

test('getSimpleSort: returns field and desc from simpleSortCriteria', t => {
  const db = new Loki('getSimpleSort1', { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection') as TDBCollection<any>
  const dynamicView = collection.ensureDynamicView('view')
  t.deepEqual(dynamicView.getSimpleSort(), { field: '', desc: false })
  dynamicView.applySimpleSort('f1', true)
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f1', desc: true })
  dynamicView.applySimpleSort('f1', { desc: true })
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f1', desc: true })
})

test('toggleSimpleSort: should set field (desc is set to default value)', t => {
  const db = new Loki('toggleSimpleSort1', { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection') as TDBCollection<any>
  const dynamicView = collection.ensureDynamicView('view')
  dynamicView.toggleSimpleSort('f1')
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f1', desc: false })
  dynamicView.toggleSimpleSort('f2')
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f2', desc: false })
})

test('toggleSimpleSort: should set field and desc', t => {
  const db = new Loki('toggleSimpleSort2', { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection') as TDBCollection<any>
  const dynamicView = collection.ensureDynamicView('view')
  dynamicView.toggleSimpleSort('f1', true)
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f1', desc: true })
  dynamicView.toggleSimpleSort('f2', true)
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f2', desc: true })
})

test('toggleSimpleSort: should toggle desc when field is the same', t => {
  const db = new Loki('toggleSimpleSort3', { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection') as TDBCollection<any>
  const dynamicView = collection.ensureDynamicView('view')
  dynamicView.toggleSimpleSort('f1')
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f1', desc: false })
  dynamicView.toggleSimpleSort('f1')
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f1', desc: true })
  dynamicView.toggleSimpleSort('f1')
  t.deepEqual(dynamicView.getSimpleSort(), { field: 'f1', desc: false })
})
