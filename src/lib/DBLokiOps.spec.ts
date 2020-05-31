import test from 'ava'

import LokiOps from './DBLokiOps'

test('$containsIgnoreCase', t => {
  t.is(LokiOps.$containsIgnoreCase('abc', 'ab'), true)
  t.is(LokiOps.$containsIgnoreCase('aBc', 'aB'), true)
  t.is(LokiOps.$containsIgnoreCase('aBc', 'ab'), true)
  t.is(LokiOps.$containsIgnoreCase('abc', 'aB'), true)
  t.is(LokiOps.$containsIgnoreCase('abc', 'd'), false)
})

test('$startsWith', t => {
  t.is(LokiOps.$startsWith('abc', 'ab'), true)
  t.is(LokiOps.$startsWith('aBc', 'ab'), false)
  t.is(LokiOps.$startsWith('aBc', 'c'), false)
})

test('$startsWithIgnoreCase', t => {
  t.is(LokiOps.$startsWithIgnoreCase('abc', 'ab'), true)
  t.is(LokiOps.$startsWithIgnoreCase('aBc', 'ab'), true)
  t.is(LokiOps.$startsWithIgnoreCase('aBc', 'c'), false)
})

test('$endsWith', t => {
  t.is(LokiOps.$endsWith('abc', 'bc'), true)
  t.is(LokiOps.$endsWith('aBc', 'bc'), false)
  t.is(LokiOps.$endsWith('aBc', 'a'), false)
})

test('$endsWithIgnoreCase', t => {
  t.is(LokiOps.$endsWithIgnoreCase('abc', 'bc'), true)
  t.is(LokiOps.$endsWithIgnoreCase('aBc', 'bc'), true)
  t.is(LokiOps.$endsWithIgnoreCase('aBc', 'a'), false)
})
