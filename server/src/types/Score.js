'use strict'

/**
 * Score =
 *   { total: Number
 *   , content: Number
 *   , location: Number
 *   , pageRank: Number
 *   }
 */

const Score = (total, content, location, pageRank) => ({
  total,
  content,
  location,
  pageRank
})

module.exports = {
  of: Score
}
