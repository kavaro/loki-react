import { useEffect, useState } from 'react'
import { DEFAULT_DB } from '../DB'
import { useDB } from './useDB'
import { TDBCollection, TDoc } from '../types'

const { isArray } = Array

export interface TUseDocOptions<T> {
  dbName?: string
  field?: keyof T
  subscribe?: boolean
  create?: () => T
}

/**
 * Get document from collection using field and id for lookup.
 * The collection must have a unique index for the field, unless the field is '$loki'.
 * Optionally a create function can passed that will create the document if it does not exist.
 * @param collection 
 * @param field 
 * @param id 
 * @param create 
 */
export function getDoc<T extends object>(
  collection: TDBCollection<T> | null,
  field: keyof T,
  id: string | number,
  create?: () => T
): T | null {
  let currentDoc: T | null = null
  if (collection) {
    currentDoc = field === '$loki' ? collection.get(id as number) : collection.by(field, id)
    if (!currentDoc && create) {
      currentDoc = collection.insert(create())
    }
  }
  return currentDoc

}

/**
 * Returns a document and its collection. 
 * When the doc does not exist and the options.create function is defined, then a document is created and inserted.
 * When the subscribe option is true, the hook will cause a rerender when the doc changes.
 * 
 * @param collectionOrName Collection or name of a existing collection
 * @param id The id of the document
 * @param options.dbName Name of the database, defaults to DEFAUL_DB
 * @param options.field Name of a unique index field, defaults to '$loki'
 * @param options.subscribe When true, subscribe to doc changes, defaults to true
 * @param options.create If doc does not exist, then insert the default doc
 * @returns The doc and its collection
 */
export function useDoc<T extends TDoc = any>(collectionOrName: string | TDBCollection<T>, id: string | number, options?: TUseDocOptions<T>): [T | void, TDBCollection<T> | null] {
  options = {
    dbName: DEFAULT_DB,
    field: '$loki',
    subscribe: true,
    ...options
  }
  const dbContext = useDB(options.dbName)
  const collection = typeof collectionOrName === 'string' ? dbContext.db.getCollection(collectionOrName) : collectionOrName
  const [doc, setDoc] = useState(() => getDoc(collection, options.field, id, options.create))
  useEffect(() => {
    const field = options.field
    const handleUpsert = (upsertedDoc: T) => {
      if (isArray(upsertedDoc)) {
        const oneDoc = upsertedDoc.find(findDoc => findDoc[field] === id)
        if (oneDoc) {
          setDoc(oneDoc)
        }
      } else if (upsertedDoc[field] === id) {
        setDoc(upsertedDoc)
      }
    }
    // also batch delete, emits 'delete' event per doc
    const handleDelete = (removedDoc: T) => {
      if (removedDoc[field] === id) {
        setDoc(null)
      }
    }
    const subscribe = options.subscribe
    if (collection && subscribe) {
      collection.addListener('insert', handleUpsert)
      collection.addListener('update', handleUpsert)
      collection.addListener('delete', handleDelete)
      setDoc(getDoc(collection, field, id, options.create))
    }
    return () => {
      if (collection && subscribe) {
        collection.removeListener('insert', handleUpsert)
        collection.removeListener('update', handleUpsert)
        collection.removeListener('delete', handleDelete)
      }
    }
  }, [collection, id, options.field, options.subscribe, options.create])
  return [doc, collection]
}