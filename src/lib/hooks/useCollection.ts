import { useEffect, useState } from 'react'
import { DEFAULT_DB } from '../DB'
import { useDB } from './useDB'
import { TDoc, TDBCollection } from '../types'

export interface TUseCollectionOptions {
  dbName?: string
  subscribe?: boolean
}

export function getData<T extends object>(collection: TDBCollection<T>): T[] {
  if (collection) {
    const docs = collection.chain().data().slice()
    if (!collection.disableFreeze) {
      Object.freeze(docs)
    }
    return docs  
  }
  return []
}

/**
 * Get all documents of a collection. 
 * @param collectionOrName Collection or name of the collection
 * @param options.dbName Name of the database, defaults to DEFAULT_DB
 * @param options.subscribe Subscribe to collection changes, defaults to true
 * @returns Array with docs array and collection
 */
export function useCollection<T extends TDoc>(collectionOrName: string | TDBCollection<T>, options?: TUseCollectionOptions): [T[], TDBCollection<T>] {
  options = {
    dbName: DEFAULT_DB,
    subscribe: true,
    ...options
  }
  const dbContext = useDB(options.dbName)
  const collection = typeof collectionOrName === 'string' ? dbContext.db.getCollection(collectionOrName) : collectionOrName
  const [data, setData] = useState(() => getData(collection))
  useEffect(() => {
    let timer: any
    const handleChange = () => {
      // throttle for correctness and performance:
      // - performance: delete and update events are emitted for every doc in a batch 
      // - correctness: batch remove emits delete event per doc before doc has been removed
      clearTimeout(timer)
      timer = setTimeout(() => setData(getData(collection)), 0) 
    }
    const subscribe = options.subscribe
    if (collection && subscribe) {
      collection.addListener('insert', handleChange)
      collection.addListener('update', handleChange)
      collection.addListener('delete', handleChange)  
    }
    return () => {
      if (collection && subscribe) {
        collection.removeListener('insert', handleChange)
        collection.removeListener('update', handleChange)
        collection.removeListener('delete', handleChange)    
      }
    }
  }, [collection, options.subscribe])
  return [data, collection]
}