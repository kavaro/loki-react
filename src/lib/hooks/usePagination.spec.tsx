import test from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { createInitialPaginationState, paginate, paginationReducer, usePagination } from '../..'

test('createInitialPaginationState: should create state based on options', t => {
  const state1 = createInitialPaginationState()
  t.deepEqual(state1, {
    offset: 0,
    page: 0,
    limit: 10,
    loading: true,
    source: [],
    total: 0,
    data: [],
    nrOfPages: 0,
    isFirstPage: true,
    isLastPage: true
  })
  const state2 = createInitialPaginationState({ offset: 0, page: 2, limit: 20 })
  t.deepEqual(state2, {
    offset: 0,
    page: 2,
    limit: 20,
    loading: true,
    source: [],
    total: 0,
    data: [],
    nrOfPages: 0,
    isFirstPage: true,
    isLastPage: true
  })
})

test('paginate: should modify state to reflect changes in page and pageSize', t => {
  const state = createInitialPaginationState()
  state.offset = 0
  state.page = 0
  state.limit = 2
  state.source = [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }]
  paginate(state)
  t.deepEqual(state, {
    offset: 0,
    page: 0,
    limit: 2,
    loading: true,
    source: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    total: 9,
    data: [{ name: 'n1' }, { name: 'n2' }],
    nrOfPages: 5,
    isFirstPage: true,
    isLastPage: false
  })
  state.page = 1
  state.limit = 3
  paginate(state)
  t.deepEqual(state, {
    offset: 0,
    page: 1,
    limit: 3,
    loading: true,
    source: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    total: 9,
    data: [{ name: 'n4' }, { name: 'n5' }, { name: 'n6' }],
    nrOfPages: 3,
    isFirstPage: false,
    isLastPage: false
  })
  state.page = 4
  state.limit = 2
  paginate(state)
  t.deepEqual(state, {
    offset: 0,
    page: 4,
    limit: 2,
    loading: true,
    source: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    total: 9,
    data: [{ name: 'n9' }],
    nrOfPages: 5,
    isFirstPage: false,
    isLastPage: true
  })
  state.page = 0
  state.limit = 10
  paginate(state)
  t.deepEqual(state, {
    offset: 0,
    page: 0,
    limit: 10,
    loading: true,
    source: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    total: 9,
    data: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    nrOfPages: 1,
    isFirstPage: true,
    isLastPage: true
  })
  state.offset = 2
  state.limit = 5
  paginate(state)
  t.deepEqual(state, {
    offset: 2,
    page: 0,
    limit: 5,
    loading: true,
    source: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    total: 9,
    data: [{ name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }],
    nrOfPages: 2,
    isFirstPage: true,
    isLastPage: false
  })
})

test('paginationReducer: should', t => {
  let state = createInitialPaginationState()
  const source = [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }]
  t.deepEqual(state = paginationReducer(state, { type: 'changed', payload: source }), {
    offset: 0,
    page: 0,
    limit: 10,
    loading: false,
    source: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    total: 9,
    data: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    nrOfPages: 1,
    isFirstPage: true,
    isLastPage: true
  })
  state = paginationReducer(state, { type: 'changed', payload: source })
  t.deepEqual(state = paginationReducer(state, { type: 'paginate', payload: { page: 1, limit: 2 } }), {
    offset: 0,
    page: 1,
    limit: 2,
    loading: false,
    source,
    total: 9,
    data: [{ name: 'n3' }, { name: 'n4' }],
    nrOfPages: 5,
    isFirstPage: false,
    isLastPage: false
  })
  t.deepEqual(state = paginationReducer(state, { type: 'paginate', payload: { limit: 3 } }), {
    offset: 0,
    page: 1,
    limit: 3,
    loading: false,
    source,
    total: 9,
    data: [{ name: 'n4' }, { name: 'n5' }, { name: 'n6' }],
    nrOfPages: 3,
    isFirstPage: false,
    isLastPage: false
  })
  t.deepEqual(state = paginationReducer(state, { type: 'paginate', payload: { page: 2 } }), {
    offset: 0,
    page: 2,
    limit: 3,
    loading: false,
    source,
    total: 9,
    data: [{ name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    nrOfPages: 3,
    isFirstPage: false,
    isLastPage: true
  })
  t.deepEqual(state = paginationReducer(state, { type: 'paginate', payload: {} }), {
    offset: 0,
    page: 2,
    limit: 3,
    loading: false,
    source,
    total: 9,
    data: [{ name: 'n7' }, { name: 'n8' }, { name: 'n9' }],
    nrOfPages: 3,
    isFirstPage: false,
    isLastPage: true
  })
  t.deepEqual(state = paginationReducer(state, { type: 'paginate', payload: { offset: 2, page: 0, limit: 5 } }), {
    offset: 2,
    page: 0,
    limit: 5,
    loading: false,
    source,
    total: 9,
    data: [{ name: 'n3' }, { name: 'n4' }, { name: 'n5' }, { name: 'n6' }, { name: 'n7' }],
    nrOfPages: 2,
    isFirstPage: true,
    isLastPage: false
  })
})

test('should paginate source', t => {
  const source1 = [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }]
  const { result, rerender } = renderHook(({ source }) => usePagination(source), { initialProps: { source: source1 } })
  const [data1, paginate1, state1] = result.current
  t.deepEqual(data1, [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }])
  t.deepEqual(state1, {
    offset: 0,
    page: 0,
    limit: 10,
    loading: false,
    source: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }],
    total: 3,
    data: [{ name: 'n1' }, { name: 'n2' }, { name: 'n3' }],
    nrOfPages: 1,
    isFirstPage: true,
    isLastPage: true
  })
  paginate1({ page: 1, limit: 2 })
  rerender({ source: source1 })
  const [data2] = result.current
  t.deepEqual(data2, [{ name: 'n3' }])
  const source2 = [{ name: 'n4' }, { name: 'n5' }, { name: 'n6' }]
  rerender({ source: source2 })
  const [data3, paginate3] = result.current
  t.deepEqual(data3, [{ name: 'n6' }])
  paginate3({ offset: 1, page: 0, limit: 1})
  rerender({ source: source2 })
  const [data4] = result.current
  t.deepEqual(data4, [{ name: 'n5' }])
})