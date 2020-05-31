import { useCallback, useState, useMemo } from 'react'
import { useFilter } from './useFilter'
import get from 'lodash.get'
import set from 'lodash.set'
import produce from 'immer'
import { TDoc, TDBDynamicView, TFilter } from '../types'

/**
 * Convert a regular expression to a string with the prefix and postfix string
 * @param regExp The RegExp to convert
 * @param prefix A prefix to remove from the regExp
 * @param postfix A postfix to remove from the regExp
 * @returns The string
 */
export function regExp2string(regExp: RegExp, prefix: string, postfix: string): string {
  const regExpString = regExp.toString()
  const begin = regExpString.indexOf('/') + prefix.length + 1
  const end = regExpString.lastIndexOf('/') - postfix.length
  const value = regExpString.slice(begin, end)
  return value
}

/**
 * Convert a string to a RegExp with prefix and postfix 
 * @param value The string 
 * @param prefix A prefix to prepend to the value before creating the RegExp
 * @param postfix A postfix to append to the value before creating the RegExp
 * @param ignoreCase When true, add the 'i' modifier to the RegExp
 * @returns
 */
export function string2regExp(value: string, prefix: string, postfix: string, ignoreCase: boolean): RegExp {
  value = `${prefix}${value}${postfix}`
  return new RegExp(value, ignoreCase ? 'i' : '')
}

/**
 * Convert a DynamicView filter  to an input value
 * @param filter 
 * @param path Path inside filter that that contains the value to be edited
 * @param type Type of filter value, is one of 'string' | 'number' | 'boolean' | 'regexp'
 * @param prefix Prefix to prepended to the value, only valid in case of 'regexp' type
 * @param postfix Postfix appended to the value, only valid in case of 'regexp' type
 */
export function filter2input(filter: any, path: string | string[], type: string, prefix: string, postfix: string): any {
  const value = get(filter, path)
  if (type === 'regexp' && (value instanceof RegExp)) {
    return regExp2string(value, prefix, postfix)
  }
  if (type === 'number' && typeof value === 'number') {
    return value.toString()
  }
  return value
}

/**
 * Assign a string input to a filter at given path
 * @param filter 
 * @param path The path where the value is located in the filter
 * @param type Type of filter value, is one of 'string' | 'number' | 'boolean' | 'regexp'
 * @param value The value to assign to the filter
 * @param refix Prefix to prepended to the value, only valid in case of 'regexp' type
 * @param postfix Postfix appended to the value, only valid in case of 'regexp' type
 * @param ignoreCase When true add the 'i' modifier to the RegExp, only valid in case of 'regexp' type
 */
export function input2filter(filter: any, path: string | string[], type: string, value: any, prefix: string, postfix: string, ignoreCase: boolean): any {
  if (type === 'regexp') {
    value = string2regExp(value, prefix, postfix, ignoreCase)
  } else if (type === 'number') {
    value = parseFloat(value)
  } else if (type === 'boolean') {
    value = !!value
  }
  return set(filter || {}, path, value)
}

export interface TUseFilterInputOptions {
  prefix?: string
  postfix?: string
  ignoreCase?: boolean
}

export interface TUseFilterInputState {
  error: Error | null
  value: string
}

/**
 * Used to bind a text input to a dynamic view filter.
 * Returns the string value of the filter, a function to set the filter value and an error.
 * ESpecially usefull for regexp filters.
 * @param dynamicView The dynamic view
 * @param name Name of the filter
 * @param path Path of the value in the filter
 * @param type Type of filter value, is one of 'string' | 'number' | 'boolean' | 'regexp'
 * @param options.prefix Prefix to prepended to the value, only valid in case of 'regexp' type, default is ''
 * @param options.postfix Postfix appended to the value, only valid in case of 'regexp' type, default is ''
 * @param options.ignoreCase When true add the 'i' modifier to the RegExp, only valid in case of 'regexp' type, default is true
 * @returns Value is the filter value at path, setValue(newValue) sets the filter value, error object
 */
export function useFilterInput<T extends TDoc>(
  dynamicView: TDBDynamicView<T>,
  name: string,
  path: string,
  type: string,
  options?: TUseFilterInputOptions
): [string, (e: any) => void, Error | null] {
  options = {
    prefix: '',
    postfix: '',
    ignoreCase: true,
    ...options
  }
  const [filter, setFilter] = useFilter(dynamicView, name)
  const filterInput = useMemo(() => {
    return filter2input(filter, path, type, options.prefix, options.postfix) || ''
  }, [filter, path, type, options.prefix, options.postfix])
  const [state, setState] = useState<TUseFilterInputState>(() => produce<TUseFilterInputState>({} as any, draft => {
    draft.error = null
    draft.value = filterInput
  }))
  const setValue = useCallback((e) => {
    let error = null
    const value = typeof e === 'string' ? e : e.target.value
    const newFilter = produce<TFilter | void>(filter, draft => {
      try {
        draft = input2filter(draft, path, type, value, options.prefix, options.postfix, options.ignoreCase)
        if (!filter) {
          return draft
        }
      } catch (err) {
        error = err
      }
      return undefined
    })
    setState(produce(draft => {
      draft.value = value
      draft.error = error
    }))
    setFilter(newFilter)
  }, [filter, path, type, options.prefix, options.postfix, options.ignoreCase, setFilter])
  return [state.error || (type === 'regexp' && filterInput === '(?:)') ? state.value : filterInput, setValue, state.error]
}

