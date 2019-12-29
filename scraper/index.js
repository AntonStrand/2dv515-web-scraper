const Async = require('crocks/Async')
const axios = require('axios').default
const curry = require('crocks/helpers/curry')
const map = require('crocks/pointfree/map')
const fanout = require('crocks/Pair/fanout')
const and = require('crocks/logic/and')
const not = require('crocks/logic/not')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const virtualConsole = new jsdom.VirtualConsole()
const { filter, pipe, prop, replace, test, values, uniq } = require('ramda')
const sanitize = require('sanitize-html')

const trimWS = replace(/\s+/g, ' ')
const clean = pipe(replace(/[".,()[\]]/g, ' '), replace(/[^a-zA-Z0-9 ]/g, ''))

/** get :: String -> Async Error a */
const get = Async.fromPromise(axios.get)

/** parseToBody :: String -> HTMLBodyElement */
const parseToBody = html =>
  new JSDOM(html, { virtualConsole }).window.document.body

const queryAll = curry((query, element) => element.querySelectorAll(query))

/** isWikiArticleLink :: String -> Boolean */
const isWikiArticleLink = and(
  test(/^\/wiki\//),
  not(test(/^\/wiki\/Wikipedia|^\/wiki\/File:|^\/wiki\/Category:/))
)

/** allProp :: [{k: v}] -> [v] */
const allProp = key => pipe(values, map(prop(key)))

const removeHTML = replace(/(<([^>]+)>)/gi, ' ')

/** getWikiContent :: HTMLBodyElement -> HTML */
const getWikiContent = element =>
  element.querySelector('#bodyContent #mw-content-text').innerHTML

const pageToWords = pipe(getWikiContent, sanitize, removeHTML, clean, trimWS)

const getLinks = pipe(
  queryAll('a'),
  allProp('href'),
  uniq,
  filter(isWikiArticleLink)
)

get('https://en.wikipedia.org/wiki/Batman')
  .map(prop('data'))
  .map(parseToBody)
  .map(fanout(pageToWords, getLinks))
  .fork(console.error, pair => console.log(pair.fst(), pair.snd()))
