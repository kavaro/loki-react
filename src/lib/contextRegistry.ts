import React from 'react'
import { TDBContext, TContextRegistry } from './types'

/**
 * In order to support multiple database instances, this registry is a map 
 * from the name of a database name to its react database Context.
 */
export class ContextRegistry extends Map implements TContextRegistry {
  /**
   * Register a DB Context, throws an error if a DB with the same name is already registered.
   * @param name Name of the DB
   * @param Context The ReactContext for the DB
   */
  public register(name: string, Context: React.Context<TDBContext>): void {
    if (this.has(name)) {
      throw new Error(`LokiReact: database "${name}" is already registered`)
    }
    this.set(name, Context)
  }

  /**
   * Get a ReactContext for DB with name
   * @param name Name of the DB
   * @returns The ReactContext for the DB
   */
  public get(name: string): React.Context<TDBContext> {
    const Context = super.get(name)
    if (!Context) {
      throw new Error(`LokiReact: database "${name}" is not registered`)
    }
    return Context
  }
}

export const contextRegistry = new ContextRegistry()
