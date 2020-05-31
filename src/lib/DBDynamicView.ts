import Loki from 'lokijs'
import { TSimpleSort } from './types'

const DynamicView = (Loki as any).DynamicView

/**
 * Helper method that, given the filter name, returns the loki filter
 * @returns The filter value or undefined if the filter does not exist
 */
DynamicView.prototype.getFilterValue = function (uid: string): any {
  const idx = this._indexOfFilterWithId(uid)
  if (idx >= 0) {
    return this.filterPipeline[idx].val
  }
}

/**
 * Helper method that returns loki simpleSortCriteria normalized to { field: string, desc: boolean }
 * @returns curerent sort criteria, when there is no sort returns field = '' and desc = false
 */
DynamicView.prototype.getSimpleSort = function (): TSimpleSort {
  const simpleSort = { propname: '', options: false, ...this.sortCriteriaSimple }
  return {
    field: simpleSort.propname,
    desc: simpleSort.options === true || simpleSort.options === false ? simpleSort.options : !!simpleSort.options.desc
  }
}

/**
 * Helper method that toggles the simple sort criteria.
 * If the field name changes then use desc as the sort direction.
 * If the field name does not change, then toggle desc
 * @param field Name of the sort field to toggle
 * @param desc Sort direction to apply when sorting another field
 */
DynamicView.prototype.toggleSimpleSort = function (field: string, desc: boolean = false): void {
  const criteria = this.getSimpleSort()
  this.applySimpleSort(field, field === criteria.field ? !criteria.desc : desc)
}
