const wordToId = {}
let size = -1

/** wordToId :: String -> Number */
module.exports = word => {
  if (wordToId[word] != null) return wordToId[word]
  else {
    wordToId[word] = ++size
    return size
  }
}
