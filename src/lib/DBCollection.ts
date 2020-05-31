import Loki from 'lokijs'
import { TDBCollection, TDBDynamicView } from './types'
import './DBDynamicView'

const Collection = (Loki as any).Collection

/**
 * Add a dynamicView if it does not exist, otherwise return the exising dynamicView
 */
Collection.prototype.ensureDynamicView = function(name: string, options?: Partial<DynamicViewOptions>): TDBDynamicView<any> {
  return this.getDynamicView(name) || this.addDynamicView(name, options)
}

export default Collection as TDBCollection<any>
