/**
 * SearchMatch
 * @param {String} url 
 * @param {Score} score 
 */
const SearchMatch = (url, score) => ({ url, score })

module.exports = {
  of: SearchMatch
}