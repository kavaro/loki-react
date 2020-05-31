import { useEffect, useReducer, useCallback } from 'react'
import produce from 'immer'
import { TDoc } from '../types'

export interface TUsePaginationOptions {
  offset: number
  page?: number
  limit?: number
}

export interface TUsePaginationState<T extends TDoc> {
  offset: number
  page: number
  limit: number
  source: T[]
  total: number
  loading: boolean
  data: T[]
  nrOfPages: number
  isFirstPage: boolean
  isLastPage: boolean
}

export interface TChangedAction<T extends TDoc> {
  type: 'changed'
  payload: T[]
}

export interface TPaginatePayload {
  offset?: number
  page?: number
  limit?: number
}

export interface TPaginateAction {
  type: 'paginate'
  payload: TPaginatePayload
}

const isNumber = (value: any) => typeof value === 'number'

/**
 * Perform pagination by copying one page from state.source to state.data.
 * Furthermore compute state.nrOfPages, state.isFirstPage, state.isLastPage
 * @param state The pagination state 
 */
export function paginate<T extends TDoc>(state: TUsePaginationState<T>): void {
  const { offset, page, limit: pageSize, source } = state
  const total = state.total = source.length
  if (offset > 0 || page > 0 || pageSize < total) {
    const begin = offset + (page * pageSize)
    const end = begin + pageSize
    state.data = source.slice(begin, end)
  } else {
    state.data = source
  }
  state.nrOfPages = Math.ceil((total - offset) / pageSize)
  state.isFirstPage = page === 0
  state.isLastPage = page >= state.nrOfPages - 1
}

/**
 * Reducer that takes a 'changed' and a 'paginate' action.
 * The 'change' action is dispatched when the source to be paginated has changed.
 * The 'paginate' action is dispatch to change the page and/or pageSize 
 * @param state See createInitialState
 * @param action Action with type and payload
 */
export function paginationReducer<T extends TDoc>(
  state: TUsePaginationState<T>, 
  action: TChangedAction<T> | TPaginateAction
): TUsePaginationState<T> {
  return produce(state, (draft: TUsePaginationState<T>) => {
    switch (action.type) {
      case 'changed':
        const { payload: changedPayload } = action as TChangedAction<T>
        draft.loading = false
        if (state.source !== changedPayload) {
          draft.source = changedPayload
          paginate(draft)
        }
        break
      case 'paginate':
        const { payload: paginatePayload } = action as TPaginateAction
        if (isNumber(paginatePayload.offset)) {
          draft.offset = Math.max(0, paginatePayload.offset)
        }
        if (isNumber(paginatePayload.page)) {
          draft.page = Math.max(0, paginatePayload.page)
        }
        if (isNumber(paginatePayload.limit)) {
          draft.limit = Math.max(1, paginatePayload.limit)
        }
        if (draft.offset !== state.offset || draft.page !== state.page || draft.limit !== state.limit) {
          paginate(draft)
        }
        break
      /* istanbul ignore next */
      default:
    }
  })
}

/**
 * Create the initial state for the reducer
 * @param options.page The current page, defaults to 0
 * @param options.pageSize The current pageSize, defaults to 10
 */
export function createInitialPaginationState<T extends TDoc>(options?: TUsePaginationOptions): TUsePaginationState<T> {
  const { offset, page, limit } = { offset: 0, page: 0, limit: 10, ...options }
  return {
    offset,
    page,
    limit,
    loading: true,
    source: [],
    total: 0,
    data: [],
    nrOfPages: 0,
    isFirstPage: true,
    isLastPage: true
  }
}

/**
 * Given an array of docs, return a slice of the array, a function to change and page/pageSize and pagination information. 
 * Can be used in pagination mode or slice mode
 * - pagination mode: limit is the page size and page is the page number (offset is typically set to 0)
 * - slice mode: limit is the number of docs, offset is the number of docs to skip (page is set to 0)
 * @param source The data source, typically an array of objects
 * @param options.offset The number of documents to skip, defaults to 0
 * @param options.page The current page, defaults to 0
 * @param options.limit The maximum number of documents to return, defaults to 10
 */
export function usePagination<T extends TDoc>(
  source: T[], 
  options?: TUsePaginationOptions
) : [TDoc[], (payload: TPaginatePayload) => void, TUsePaginationState<TDoc>] {
  const [state, dispatch] = useReducer(paginationReducer, options, createInitialPaginationState)
  const dispatchPaginate = useCallback((payload: TPaginatePayload) => dispatch({ type: 'paginate', payload }), [])
  useEffect(() => {
    dispatch({ type: 'changed', payload: source })
  }, [source])
  return [state.data, dispatchPaginate, state]
}