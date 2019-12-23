const { map, reduce, zipWith } = require ('list/curried')
const { hasLinkTo } = require ('../types/Page')
const { lensProp, set, pipe, prop } = require ('ramda')
const { normalize } = require ('./normalization')
const converge = require ('crocks/combinators/converge')
const identity = require ('crocks/combinators/identity')

/** normalizePageRanks :: List Page -> List Page */
const normalizePageRanks = 
  converge (
    zipWith (set (lensProp ('pageRank'))),
    pipe (map (prop ('pageRank')), normalize),
    identity
  )

/** calculatePageRank :: Number -> List Page -> List Page */
const calculatePageRank = iterations => pages =>
  iterations < 0 ? normalizePageRanks (pages)
  : calculatePageRank (iterations-1) (map (page => set (lensProp ('pageRank'), pageRank (pages) (page), page), pages))

/** pageRank :: List Page -> Page -> Number */
const pageRank = pages => page =>
  reduce ((pr, p) => hasLinkTo (page) (p) ? pr + p.pageRank / p.links.size : pr, 0, pages) * 0.85 + 0.15

module.exports = calculatePageRank