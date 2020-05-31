import { useEffect, useState } from 'react'
import produce from 'immer'
import { TDoc, TSimpleSort, TDBDynamicView } from '../types'

/**
 * Get the simple sort criteria of a dynamic view, updates automatically when simple sort criteria have changed
 * @param dynamicView 
 */
export function useSimpleSort<T extends TDoc>(dynamicView?: TDBDynamicView<T>): TSimpleSort {
  const [simpleSort, setSimpleSort] = useState(() => dynamicView ? dynamicView.getSimpleSort() : { field: '', desc: false })
  useEffect(() => {
    const listener = () => setSimpleSort(state => produce(state, draft => {
      const { field, desc } = dynamicView.getSimpleSort()
      draft.field = field
      draft.desc = desc
    }))
    if (dynamicView) {
      dynamicView.addListener('sort', listener)
      listener()
    }
    return () => {
      if (dynamicView) {
        dynamicView.removeListener('sort', listener)
      }
    }
  }, [dynamicView])
  return simpleSort
}