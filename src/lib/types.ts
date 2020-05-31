import React from 'react'

export interface TSimpleSort {
  field: string
  desc: boolean
}

export interface TFilter {
  type: 'find' | 'where'
  val: any
  uid?: string | number
}

export type TSerializeReplacerKey = "autosaveHandle" | "persistenceAdapter" | "constraints" | "ttl" | "throttledSavePending" | "throttledCallbacks" | string

export interface TLoadJSONOptions {
  serializationMethod?: "normal" | "pretty" | "destructured" | null
  retainDirtyFlags?: boolean
  throttledSaves?: boolean
  [collName: string]: any | { proto?: any, inflate?: (src: object, dest?: object) => void }
}

export interface TDBDynamicView<T extends object> extends DynamicView<T> {
  getFilterValue(uid: string): any
  getSimpleSort(): TSimpleSort
  toggleSimpleSort(field: string, desc?: boolean): void
}

/**
 * Add disableFreeze option to collection options
 */
export interface TDBCollectionOptions<T extends object> extends Partial<CollectionOptions<T>> {
  disableFreeze?: boolean
}

export interface TDBCollection<T extends object> extends Collection<T> {
  disableFreeze: boolean
  addDynamicView(name: string, options?: Partial<DynamicViewOptions>): TDBDynamicView<T>
  getDynamicView(name: string): TDBDynamicView<T> | null
  ensureDynamicView(name: string, options?: Partial<DynamicViewOptions>): TDBDynamicView<T>
}

export interface TContextRegistry extends Map<string, React.Context<TDBContext>> {
  register(name: string, Context: React.Context<TDBContext>): void 
  get(name: string): React.Context<TDBContext>
}

export interface TDBOptions extends Partial<LokiConstructorOptions>, Partial<LokiConfigOptions>, Partial<ThrottledSaveDrainOptions> {
  registry: TContextRegistry
}

export interface TDB extends Loki {
  destroy(): void
  getCollection<T extends object = any>(name: string): TDBCollection<T>
  addCollection<T extends object = any>(name: string, options?: Partial<CollectionOptions<T>>): TDBCollection<T>
  ensureCollection<T extends object = any>(name: string, options: CollectionOptions<T>): TDBCollection<T>
  waitUntilLoaded(): Promise<void>
}

export interface TDoc {
  $loki?: number
  meta?: {
    created: number; // Date().getTime()
    revision: number;
    updated: number; // Date().getTime()
    version: number;
  }
  [field: string]: any
}

export interface TDBContext {
  readonly db: TDB
}

