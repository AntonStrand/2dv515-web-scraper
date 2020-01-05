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
  head,
  join,
  last,
  pipe,
  prop,
  replace,
  split,
  take,
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

/** getWikiContent :: HTMLBodyElement -> HTMLElement */
const getWikiContent = element =>
  element.querySelector('#bodyContent #mw-content-text')

/** innerHTML :: HTMLElement -> String */
const innerHTML = element => element.innerHTML

/** pageToWords :: HTMLBodyElement -> String */
const pageToWords = pipe(
  getWikiContent,
  innerHTML,
  sanitize,
  removeHTML,
  clean,
  trimWS,
  trim
)

/** getLinks :: HTMLBodyElement -> [Link] */
const getLinks = pipe(
  getWikiContent,
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

/** concat :: a -> a -> [a] */
const concat = x => y => (Array.isArray(y) ? y.concat(x) : [y].concat(x))

/** :: String -> Async [String, String] */
const saveArticleData = path =>
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

/** getArticleLinks :: String -> Async [String] */
const getArticleLinks = path =>
  get(`https://en.wikipedia.org${path}`)
    .map(prop('data'))
    .map(parseToBody)
    .map(getLinks)

/** getAllLinks :: (String, Number, ?[String]) -> Async [String] */
const getAllLinks = (path, max, allLinks = []) =>
  getArticleLinks(path)
    .map(concat(path))
    .map(concat(allLinks))
    .map(uniq)
    .chain(links =>
      links.length >= max
        ? Async.of(links)
        : getAllLinks(head(links), max, links)
    )
    .map(take(max))

/** main :: String -> () */
const main = path =>
  getAllLinks(path, 200)
    .map(map(saveArticleData))
    .chain(sequence(Async))
    .fork(console.error, ({ length }) =>
      console.log(`${length} articles based on "${path}" has been saved.`)
    )

main(process.argv[2])
