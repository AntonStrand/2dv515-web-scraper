'use strict'

const List = require ('list/curried')
const isEmpty = require ('crocks/predicates/isEmpty')
const not = require ('crocks/logic/not')
const filter = require ('ramda/src/filter')
const pipe = require ('ramda/src/pipe')
const reduce = require ('ramda/src/reduce')
const split = require ('ramda/src/split')

/** minimum :: Foldable f => f Number -> Number */
const minimum = reduce (Math.min, Infinity)

/** maximum :: Foldable f => f Number -> Number */
const maximum = reduce (Math.max, -Infinity)

/** words :: String -> List String */
const words = pipe (
  split (/\s+/g),
  List.from,
  List.reduce (
    (ws, w) => (!isEmpty (w) ? List.append (w.toLowerCase (), ws) : ws),
    List.empty ()
  )
)

/** lines :: String -> Set String */
const lines = pipe (
  split ('\n'),
  filter (not (isEmpty))
)

const time = fn => (...args) => {
  const start = Date.now ()
  const result = fn (...args)
  return [ Date.now () - start, result ]
}

const roundTo2 = n => Math.round (n * 100) / 100

module.exports = {
  maximum,
  minimum,
  words,
  lines,
  time,
  roundTo2
}
