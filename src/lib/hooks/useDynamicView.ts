import { useEffect, useState, useMemo } from 'react'
import produce from 'immer'
import { v4 as uuid } from 'uuid'
import { DEFAULT_DB } from '../DB'
import { useDB } from './useDB'
import { TDBCollection, TDBDynamicView, TDoc } from '../types'

export interface TUseDynamicView {
  dbName?: string
  name?: string
  subscribe?: boolean
  viewOptions?: DynamicViewOptions
}

/**
 * Get docs from a dynamicView. 
 * When subscribe is true, subscribe to changes.
 * When name is not defined, then a uuid is generated for the name and the dynamicView will be removed automatically
 * 
 * 
 * @param collectionOrName Name of the collection or the collection
 * @param options.dbName Name of the database, defaults to DEFAULT_DB
 * @param options.name Name of the dynamicView, default to a auot generated uuid
 * @param options.subscribe When true, subscribe to changes, defaults to true
 * @param options.viewOptions DynamicView options to use when dynamicView needs to be created
 * @returns An array with documents, the dynamicView and a loading boolean 
 */
export function useDynamicView<T extends TDoc>(collectionOrName: string | TDBCollection<T>, options?: TUseDynamicView): [T[], TDBDynamicView<T> | null, boolean] {
  const [autoRemove, name] = useMemo(() => {
    return !options || typeof options.name !== 'string' ? [true, uuid()] : [false, options.name]
  }, [!!options, options.name])
  options = {
    dbName: DEFAULT_DB,
    subscribe: true,
    ...options
  }
  const dbContext = useDB(options.dbName)
  const collection = typeof collectionOrName === 'string' ? dbContext.db.getCollection(collectionOrName) : collectionOrName
  const dynamicView = collection ? collection.ensureDynamicView(name, options.viewOptions) : null
  const [state, setState] = useState(() => produce({}, () => ({ loading: !!dynamicView, data: [] })))
  useEffect(() => {
    const listener = () => {
      const newState = {
        loading: false,
        data: dynamicView.data()
      }
      if (!collection.disableFreeze) {
        /* istanbul ignore if */
        if (!Object.isFrozen(state.data)) {
          Object.freeze(state.data)
        }
        /* istanbul ignore if */
        if (!Object.isFrozen(state)) {
          Object.freeze(state)
        }
      }
      setState(newState)
    }
    const subscribe = options.subscribe
    if (dynamicView) {
      if (subscribe) {
        dynamicView.addListener('rebuild', listener)
      }
      listener()
    }
    return () => {
      if (dynamicView) {
        if (subscribe) {
          dynamicView.removeListener('rebuild', listener)
        }
        if (autoRemove) {
          collection.removeDynamicView(dynamicView.name)
        }
      }
    }
  }, [collection, dynamicView, autoRemove, name, options.subscribe])
  return [state.data, dynamicView, state.loading]
}

