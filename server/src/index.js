'use strict'
const http = require ('http')
const { mount, logger, cors } = require ('paperplane')
const PORT = 3001

const routes = require ('./routes')

const initDatabase = require ('./repositories/pages')

console.time ('\nInitializing took')
initDatabase.fork (console.error, pages => {
  console.timeEnd ('\nInitializing took')
  const app = cors (routes (pages))
  http
    .createServer (mount ({ app, logger }))
    .listen (PORT, () =>
      console.log (
        `\nServer is running on port ${PORT}\nPress ctrl+c to terminate...\n`
      ))
})
