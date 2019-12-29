const Async = require('crocks/Async')
const axios = require('axios').default
const curry = require('crocks/helpers/curry')
const map = require('crocks/pointfree/map')
const branch = require('crocks/Pair/branch')
const and = require('crocks/logic/and')
const not = require('crocks/logic/not')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const virtualConsole = new jsdom.VirtualConsole()
const { filter, pipe, prop, replace, test, values } = require('ramda')
const sanitize = require('sanitize-html')

const trimWS = replace(/\s+/g, ' ')
const clean = pipe(replace(/[".,()[\]]/g, ' '), replace(/[^a-zA-Z0-9 ]/g, ''))

/** get :: String -> Async Error a */
const get = Async.fromPromise(axios.get)

/** parseToBody :: String -> HTMLBodyElement */
const parseToBody = html =>
  new JSDOM(html, { virtualConsole }).window.document.body

const queryAll = curry(
  (query, element) => console.log(element) || element.querySelectorAll(query)
)

const isWikiArticle = and(
  test(/^\/wiki\//),
  and(not(test(/^\/wiki\/Wikipedia/)), not(test(/^\/wiki\/File:/)))
)

/** allProp :: [{k: v}] -> [v] */
const allProp = key => pipe(values, map(prop(key)))

const removeHTML = replace(/(<([^>]+)>)/gi, '')

get('https://en.wikipedia.org/wiki/Batman')
  .map(prop('data'))
  .map(branch)
  .map(map(parseToBody))
  .map(map(queryAll('a')))
  .map(map(allProp('href')))
  .map(map(filter(isWikiArticle)))
  .fork(console.error, pair =>
    console.log(trimWS(clean(removeHTML(sanitize(pair.fst())))))
  )
