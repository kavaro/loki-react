import { createContext } from 'react'
import Loki from 'lokijs'
import isPlainObject from 'is-plain-object'
import { contextRegistry as defaultContextRegistry, ContextRegistry } from './contextRegistry'
import { TSerializeReplacerKey, TLoadJSONOptions, TDBCollection, TDB, TDBOptions, TDBContext, TDBCollectionOptions } from './types'
import DBLokiOps, { TDBOps } from './DBLokiOps'
import './DBCollection'

export const DEFAULT_DB = 'app.db'
export const TYPE_KEY = '4b786861-238d-429b-b67f-a41645eaeffa'

export const delay = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Class that extends the Loki database with the following features:
 * - The database registers itself with the Context registry
 * - Add the ensureCollection method
 * - Add waitUntilLoaded method 
 * - Add the ready property, a promise that resolves when the database has autoloaded 
 * - Add the autoloading property, true while autoloading
 * - Add the loaded property, true after first load
 * - Additional DB.LokiOps
 * - Support RegExp types during database serialization and deserialization
 */
export class DB extends Loki implements TDB {
  public registry: ContextRegistry
  public autoloading: boolean
  public loaded: boolean
  public ready: Promise<void>

  /**
   * LokiOps: extended version of loki operations
   */
  public static LokiOps: TDBOps = DBLokiOps
  /**
   * Object with serializableTypes, add your own custom types for (de)serialization
   */
  public static serializableTypes = {
    RegExp: {
      serialize: (value: RegExp): string => value.toString(),
      deserialize: (serialized: string): RegExp | string => {
        if (serialized[0] === '/') {
          const end = serialized.lastIndexOf('/');
          if (end > 0) {
            const modifiers = serialized.slice(end + 1);
            const pattern = serialized.slice(1, end);
            return new RegExp(pattern, modifiers);
          }  
        }
        return serialized
      }
    }
  }

  /**
   * Create a new database using one of the following constuctor combinations
   * - db = new DB('name', { ...options })
   * - db = new DB({ ...options })
   * - db = new DB('name')
   * - db = new DB()
   * @param dbName Name of the database or database options
   * @param options Database options
   */
  constructor(dbName?: string | TDBOptions, options?: TDBOptions) {
    if (typeof dbName !== 'string') {
      options = dbName
      dbName = DEFAULT_DB
    }
    const { registry, ...lokiOptions } = { registry: defaultContextRegistry, ...options }
    super(dbName, lokiOptions)
    this.autoloading = !!lokiOptions.autoload
    this.loaded = false
    this.ready = this.autoloading ? this.waitUntilLoaded() : Promise.resolve()
    this.registry = registry
    this.registry.register(this.filename, createContext<TDBContext>({ db: this }))
  }

  /**
   * Removes the database from the registry, its react context will be deleted
   */
  public destroy(): void {
    this.registry.delete(this.filename)
  }

  /**
   * Get collection (the collection has a number of additonal methods and options, see DBCollection)
   * @param name Name of the collection
   */
  public getCollection<F extends object = any>(name: string): TDBCollection<F> {
    return super.getCollection(name) as unknown as TDBCollection<F>
  }

  /**
   * Add collection using options (the collection has a number of additonal methods and options, see DBCollection)
   * @param name Name of the collections
   * @param options Collection options
   */
  public addCollection<F extends object = any>(name: string, options?: TDBCollectionOptions<F>): TDBCollection<F> {
    return super.addCollection(name, options) as unknown as TDBCollection<F>
  }

  /**
   * 
   * @param name Add a collection if it does not exist, otherwise, returns the collection
   * @param options Collection options to use in case it needs to be created
   */
  public ensureCollection<F extends object = any>(name: string, options?: TDBCollectionOptions<F>): TDBCollection<F> {
    return this.getCollection(name) || (this.addCollection(name, options))
  }

  /**
   * Returns a promise that resolves the next time the database is loaded
   */
  public async waitUntilLoaded(): Promise<void> {
    this.loaded = false
    return new Promise(resolve => {
      let resolved = false
      const listener = async () => {
        if (!resolved) {
          this.autoloading = false
          this.loaded = true
          resolved = true
          resolve()
          await delay(0) // calling removeListener from listener results in endless loop
          this.removeListener('loaded', listener)
        }
      }
      this.addListener('loaded', listener)
    })
  }

  /**
   * Copy of the loki serializeReplacer method, extended with regular expression serialization
   * @param key 
   * @param value 
   */
  public serializeReplacer(key: TSerializeReplacerKey, value: any): any {
    /*istanbul ignore else */
    if (value instanceof RegExp) {
      return {
        [TYPE_KEY]: {
          type: 'RegExp',
          value: DB.serializableTypes.RegExp.serialize(value)
        }
      }
    }
    /* istanbul ignore next */
    switch (key) {
      case 'autosaveHandle':
      case 'persistenceAdapter':
      case 'constraints':
      case 'ttl':
        return null;
      case 'throttledSavePending':
      case 'throttledCallbacks':
        return undefined;
      case 'lokiConsoleWrapper':
        return null;
      default:
        return value;
    }
  }

  /**
   * A JSON parse reviver method to deserialize regular expressions
   * @param _
   * @param value 
   */
  public deserializeReviver(_: string, value: any): any {
    if (isPlainObject(value) && isPlainObject(value[TYPE_KEY])) {
      const obj = value[TYPE_KEY]
      const entry = DB.serializableTypes[obj.type]
      if (entry) {
        return entry.deserialize(obj.value)
      }
    }
    return value
  }

  /**
   * Cope of loki loadJSON method that calls the deserializeReviver method
   * @param serializedDb 
   * @param options 
   */
  /* istanbul ignore next */
  public loadJSON(serializedDb: string, options?: TLoadJSONOptions): void {
    let dbObject: any;
    if (serializedDb.length === 0) {
      dbObject = {};
    } else {

      // using option defined in instantiated db not what was in serialized db
      switch (this.options.serializationMethod) {
        case "normal":
        case "pretty": dbObject = JSON.parse(serializedDb, this.deserializeReviver); break;
        case "destructured": dbObject = this.deserializeDestructured(serializedDb); break;
        default: dbObject = JSON.parse(serializedDb, this.deserializeReviver); break;
      }
    }

    this.loadJSONObject(dbObject, options);
  }

}

