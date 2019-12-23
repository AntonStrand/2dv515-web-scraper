'use strict'

const fs = require ('fs')
const Async = require ('crocks/Async')
const fanout = require ('crocks/Pair/fanout')
const List = require ('list/curried')
const { chain, concat, map, pipe } = require ('ramda')
const liftA2 = require ('crocks/helpers/liftA2')
const sequence = require ('crocks/pointfree/sequence')
const traverse = require ('crocks/pointfree/traverse')
const Page = require ('../types/Page')
const { words, lines } = require ('../utils')
const wordToId = require ('../models/wordToId')
const calculatePageRank = require ('../models/calculatePageRank')

/** readdir :: String -> Async Error [String] */
const readdir = Async.fromNode (fs.readdir)

/** readFile :: String -> Async Error a */
const readFile = path => Async.fromNode (fs.readFile) (path, 'utf8')

/** fullPaths :: String -> Async Error [ Pair URL String ] */
const fullPaths = path =>
  readdir (path).map (
    map (fanout (concat ('https://en.wikipedia.org/wiki/'), concat (path)))
  )

/** toLinks :: String -> Set String */
const toLinks = pipe (lines, map (concat ('https://en.wikipedia.org')), xs => new Set (xs))

/** getPageLinks :: String -> Async Error List (Set String) */
const getPageLinks = path =>
  readdir (path)
    .chain (traverse (Async, pipe (concat (path), readFile, map (toLinks))))
    .map (List.from)

/** toWordIds :: String -> List Number */
const toWordIds = pipe (
  words,
  List.map (wordToId)
)

/** readPageFiles :: Async List Pair String String -> Async List (Pair String List Number) */
const readPageFiles = pipe (
  map (map (traverse (Async, pipe (readFile, map (toWordIds))))),
  chain (sequence (Async)),
  map (List.from)
)

/** getPageContent :: String -> Async List (Pair String List Number) */
const getPageContent = pipe (
  fullPaths,
  readPageFiles
)

/** allPageLinks :: Async Error (List Set String) */
const allPageLinks = liftA2 (
  List.concat,
  getPageLinks ('./dataset/Links/Programming/'),
  getPageLinks ('./dataset/Links/Games/')
)

/** allPageContent :: Async Error (List Pair String List Number) */
const allPageContent = liftA2 (
  List.concat,
  getPageContent ('./dataset/Words/Programming/'),
  getPageContent ('./dataset/Words/Games/')
)

/** toPage :: (Set String, Pair String List Number) -> Page */
const toPage = (links, { fst, snd }) => Page.of (fst (), snd (), links, 1)

const readPages = () =>
  liftA2 (List.zipWith (toPage), allPageLinks, allPageContent)

module.exports = readPages ().map (calculatePageRank (20))
