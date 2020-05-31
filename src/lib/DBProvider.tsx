import React, { FC, ReactElement } from 'react'
import { useDBContext } from './hooks/useDBContext'
import { TDB } from './types'
import { contextRegistry, ContextRegistry } from './contextRegistry'

export interface DBProviderProps {
  db: TDB,
  registry?: ContextRegistry,
  children: ReactElement | ReactElement[]
}

/**
 * React database provider
 * @prop db The database to provide
 * @prop registry Optional prop provided for testing purposes
 */
export const DBProvider: FC<DBProviderProps> = ({ db, registry, children }): ReactElement => {
  const [value, Context] = useDBContext(db, registry)
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

DBProvider.defaultProps = {
  registry: contextRegistry
}


