import test from 'ava'
import Loki from 'lokijs'
import './DBCollection'
import { TDBCollection } from './types'

test('ensureDynamicView: adds dynamic view when it does not exist', t => {
  const db = new Loki('ensureDynamicView1', { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection') as TDBCollection<any>
  t.is(collection.getDynamicView('view'), null)
  const dynamicView = collection.ensureDynamicView('view')
  t.assert(dynamicView instanceof (Loki as any).DynamicView)
})

test('ensureDynamicView: gets dynamic view when it exists', t => {
  const db = new Loki('ensureDynamicView2', { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection') as TDBCollection<any>
  const dynamicView = collection.addDynamicView('view')
  t.is(collection.ensureDynamicView('view'), dynamicView)
})

