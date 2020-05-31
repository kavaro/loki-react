import { useState, useEffect } from 'react'
import { contextRegistry, ContextRegistry } from '../contextRegistry'
import { TDB, TDBContext } from '../types'

/**
 * Get the database react context form the registry. Returns the react context value and the react context
 * When the database (re)loads, the react context value is automatically updated because after a load
 * references to collections, dynamicViews, etc have changed.
 * @param db The database
 * @returns react context value and react context
 */
export function useDBContext(db: TDB, registry: ContextRegistry = contextRegistry): [TDBContext, React.Context<TDBContext>] {
  const Context = registry.get(db.filename)
  const [value, setState] = useState<TDBContext>({ db })
  useEffect(() => {
    const listener = () => setState({ db })
    db.addListener('loaded', listener)
    return () => {
      db.removeListener('loaded', listener)
    }
  }, [db])
  return [value, Context]
}

