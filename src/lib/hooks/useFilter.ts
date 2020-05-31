import { useEffect, useState, useCallback } from 'react'
import { TDoc, TDBDynamicView } from '../types'

/**
 * Get/set a dynamic view filter by its name
 * @param dynamicView The DynamicView
 * @param uid Name of the filter 
 * @returns The filter value and a function to set the filter value
 */
export function useFilter<T extends TDoc>(dynamicView: TDBDynamicView<T>, uid: string): [any, (val?: any) => void] {
  const [{ filterValue }, setFilterValue] = useState(() => ({ filterValue: dynamicView ? dynamicView.getFilterValue(uid) : undefined }))
  const setFilter = useCallback((val?: any) => {
    if (dynamicView) {
      if (val) {
        if (typeof val === 'function') {
          dynamicView.applyWhere(val, uid)
        } else {
          dynamicView.applyFind(val, uid)
        }
      } else if (filterValue) {
        dynamicView.removeFilter(uid)
      }  
    }
  }, [dynamicView, filterValue, uid])
  useEffect(() => {
    const listener = () => setFilterValue({ filterValue: dynamicView.getFilterValue(uid) })
    if (dynamicView) {
      dynamicView.addListener('filter', listener)
      listener()  
    }
    return () => {
      if (dynamicView) {
        dynamicView.removeListener('filter', listener)
      }
    }
  }, [dynamicView, uid])
  return [filterValue, setFilter]
}