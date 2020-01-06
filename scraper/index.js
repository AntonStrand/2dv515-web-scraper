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
const sanitize = require('sanitize-html')
const {
  filter,
  concat,
  join,
  last,
  pipe,
  prop,
  replace,
  split,
  tail,
  test,
  trim,
  values,
  uniq
} = require('ramda')

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

/** getWikiContentElement :: HTMLBodyElement -> HTMLElement */
const getWikiContentElement = element =>
  element.querySelector('#bodyContent #mw-content-text')

/** innerHTML :: HTMLElement -> String */
const innerHTML = element => element.innerHTML

/** pageToWords :: HTMLBodyElement -> String */
const pageToWords = pipe(
  getWikiContentElement,
  innerHTML,
  sanitize,
  removeHTML,
  clean,
  trimWS,
  trim
)

/** getLinks :: HTMLBodyElement -> [Link] */
const getLinks = pipe(
  getWikiContentElement,
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

/** saveArticleData :: String -> Async [Link] */
const saveArticleData = path =>
  console.log(path) ||
  get(`https://en.wikipedia.org${path}`)
    .map(prop('data'))
    .chain(writeFile(`./HTML/${articleName(path)}.html`))
    .map(parseToBody)
    .map(fanout(pageToWords, getLinks))
    .map(
      bimap(
        writeFile(`../server/dataset/Words/${articleName(path)}`),
        pipe(
          formatLinks,
          writeFile(`../server/dataset/Links/${articleName(path)}`)
        )
      )
    )
    .map(pairToArray)
    .chain(sequence(Async))
    .map(pipe(last, split('\n')))

/** scrape :: Number -> [String] -> [String] -> Number */
const scrape = max => visited => ([path, ...paths]) =>
  max <= 0
    ? Async.of(visited.length)
    : visited.includes(path)
    ? scrape(max)(visited)(paths)
    : saveArticleData(path)
        .map(concat(paths))
        .map(tail)
        .chain(scrape(max - 1)(visited.concat(path)))

/** main :: String -> () */
const main = path =>
  scrape(200)([])([path]).fork(console.error, count =>
    console.log(`\n${count} unique articles based on "${path}" has been saved.`)
  )

main(process.argv[2])
