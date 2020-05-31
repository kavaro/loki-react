import { useContext } from 'react'
import { DEFAULT_DB } from '../DB'
import { contextRegistry } from '../contextRegistry'
import { TDBContext } from '../types'

/**
 * Get database from react context
 * @param name Name of the database, defaults to DEFAULT_DB
 * @param registry the registry to get react context from, defaults to contextRegistry (mainly used for testing)
 * @returns {{db: DB}} Object with db: Database
 */
export const useDB = (name: string = DEFAULT_DB, registry = contextRegistry): TDBContext => {
  const Context = registry.get(name)
  return useContext(Context)
}
