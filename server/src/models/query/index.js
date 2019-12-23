'use strict'

const Pair = require ('crocks/Pair')
const List = require ('list/curried')
const { addIndex, pipe, prop, reduce } = require ('ramda')
const merge = require ('crocks/pointfree/merge')
const bimap = require ('crocks/pointfree/bimap')
const wordToId = require ('../wordToId')
const Score = require ('../../types/Score')
const SearchMatch = require ('../../types/SearchMatch')
const { words, roundTo2 } = require ('../../utils')
const { normalize, normalizeInverted } = require ('../normalization')

/** documentLocation :: List Number -> Page -> Number */
const locationScore = queryIds => ({ words }) =>
  reduce (
    (score, q) => {
      const index = List.indexOf (q, words)
      const increment = index >= 0 ? index + 1 : 1000000
      return score + increment
    },
    0,
    queryIds
  )

/** frequencyScore :: (List Number) -> Page -> Number */
const frequencyScore = queryIds =>
  pipe (
    prop ('words'),
    reduce ((score, word) => (List.includes (word, queryIds) ? score + 1 : score), 0)
  )

const toScores = merge ((l1, l2) =>
  addIndex (reduce) (
    (list, n, i) => List.append ({ content: n, location: List.nth (i, l2) }, list),
    List.empty (),
    l1
  ))

/** getScores :: (List Number) -> (List Page) -> Pair (List Number) (List Number) */
const getScores = queryIds =>
  reduce (
    (scores, page) =>
      scores.bimap (
        List.append (frequencyScore (queryIds) (page)),
        List.append (locationScore (queryIds) (page))
      ),
    Pair (List.empty (), List.empty ())
  )

/** getNormalizedScores :: List Page -> List Number -> List Pair Number Number */
const getNormalizedScores = pages => queryIds =>
  pipe (
    getScores (queryIds),
    bimap (normalize, normalizeInverted),
    toScores
  ) (pages)

/** matches :: List Page -> List Pair Number Number -> List SearchMatch */
const matches = pages =>
  pipe (
    addIndex (reduce) (
      (results, { content, location }, i) => {
        if (content <= 0) return results

        const {url, pageRank} = List.nth (i, pages)
        return List.append (
            SearchMatch.of (
              url,
              Score.of (
                roundTo2 (content + 0.8 * location + 0.5 * pageRank),
                roundTo2 (content),
                roundTo2 (location * 0.8),
                roundTo2 (pageRank * 0.5)
              )
            ),
            results
          )
      },
      List.empty ()
    ),
    List.sortWith ((a, b) => b.score.total - a.score.total)
  )

/** query :: List Page -> String -> List SearchMatch */
const query = pages =>
  pipe (
    words,
    List.map (wordToId),
    getNormalizedScores (pages),
    matches (pages)
  )

module.exports = query
