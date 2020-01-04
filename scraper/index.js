const Async = require('crocks/Async')
const fs = require('fs')
const axios = require('axios').default
const curry = require('crocks/helpers/curry')
const map = require('crocks/pointfree/map')
const fanout = require('crocks/Pair/fanout')
const bimap = require('crocks/pointfree/bimap')
const sequence = require('crocks/pointfree/sequence')
const and = require('crocks/logic/and')
const not = require('crocks/logic/not')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const virtualConsole = new jsdom.VirtualConsole()
const {
  filter,
  join,
  last,
  pipe,
  prop,
  replace,
  split,
  test,
  trim,
  values,
  uniq
} = require('ramda')
const sanitize = require('sanitize-html')

const trimWS = replace(/\s+/g, ' ')
const clean = pipe(replace(/[".,()[\]]/g, ' '), replace(/[^a-zA-Z0-9 ]/g, ''))

/** get :: String -> Async Error a */
const get = Async.fromPromise(axios.get)

/** writeFile :: String -> a -> Async a */
const writeFile = curry((path, data) =>
  Async.fromNode(fs.writeFile)(path, data).map(() => data)
)

/** parseToBody :: String -> HTMLBodyElement */
const parseToBody = html =>
  new JSDOM(html, { virtualConsole }).window.document.body

const queryAll = curry((query, element) => element.querySelectorAll(query))

/** isWikiArticleLink :: String -> Boolean */
const isWikiArticleLink = and(
  test(/^\/wiki\//),
  not(test(/^\/wiki\/Wikipedia|^\/wiki\/.*:.*/))
)

/** allProp :: [{k: v}] -> [v] */
const allProp = key => pipe(values, map(prop(key)))

const removeHTML = replace(/(<([^>]+)>)/gi, ' ')

/** getWikiContent :: HTMLBodyElement -> HTML */
const getWikiContent = element =>
  element.querySelector('#bodyContent #mw-content-text').innerHTML

/** pageToWords :: HTMLBodyElement -> String */
const pageToWords = pipe(
  getWikiContent,
  sanitize,
  removeHTML,
  clean,
  trimWS,
  trim
)

/** getLinks :: HTMLBodyElement -> [Link] */
const getLinks = pipe(
  queryAll('a'),
  allProp('href'),
  uniq,
  filter(isWikiArticleLink)
)

/** formatLinks :: [Link] -> String */
const formatLinks = join('\n')

/** articleName :: Link -> String */
const articleName = pipe(split('/'), last)

/** pairToArray :: Pair a b -> [a, b] */
const pairToArray = pair => pair.toArray()

const getArticleData = path =>
  get(`https://en.wikipedia.org${path}`)
    .map(prop('data'))
    .chain(writeFile(`./HTML/${articleName(path)}.html`))
    .map(parseToBody)
    .map(fanout(pageToWords, getLinks))
    .map(
      bimap(
        writeFile(`./Words/${articleName(path)}`),
        pipe(formatLinks, writeFile(`./Links/${articleName(path)}`))
      )
    )
    .map(pairToArray)
    .chain(sequence(Async))

getArticleData('/wiki/Gaming').fork(console.error, console.log)
