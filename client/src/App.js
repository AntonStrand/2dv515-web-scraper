import React, { useState } from 'react'
import './App.css'

// toLink :: URL -> JSX
const toLink = url => (
  <a href={url} target='_blank' rel='noopener noreferrer'>
    {url
      .split('/')
      .pop()
      .replace(/%2B/g, '+')}
  </a>
)

// toResultMessage :: Result -> JSX
const toResultMessage = ({ executionTime, numResults }) =>
  executionTime ? (
    <p>{`Found ${numResults} results in ${executionTime} sec`}</p>
  ) : (
    ''
  )

// formatQuery :: String -> String
const formatQuery = query =>
  query
    .replace(/[+]/g, '%2B')
    .split(/\s+/g)
    .join('+')

// searchFor :: String -> Promise Error Result
const searchFor = query =>
  window.fetch(`http://localhost:3001/search?q=${formatQuery(query)}`)

function App () {
  const [results, setResults] = useState({ topResults: [] })
  const [query, setQuery] = useState('')

  // search :: Event -> State Event
  const search = e => {
    e.preventDefault()
    if (query !== '') {
      searchFor(query)
        .then(res => res.json())
        .then(setResults)
    }
  }

  return (
    <div className='wrapper'>
      <header>
        <h1>A3 - Search Engine</h1>
      </header>
      <main>
        <form>
          <input
            type='text'
            placeholder='Search...'
            onChange={e => setQuery(e.target.value)}
          />
          <button type='submit' onClick={search}>
            Search
          </button>
        </form>
        <table>
          <tbody>
            <tr>
              <th className='alignLeft'>Page</th>
              <th>Score</th>
              <th>Content</th>
              <th>Location</th>
              <th>Page rank</th>
            </tr>
            {results.topResults.map(({ url, score }) => (
              <tr key={url}>
                <td className='alignLeft'>{toLink(url)}</td>
                <td>{score.total}</td>
                <td>{score.content}</td>
                <td>{score.location}</td>
                <td>{score.pageRank}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {toResultMessage(results)}
      </main>
      <footer>
        <p>
          Created by <a href='https://github.com/antonstrand'>Anton Strand</a>
        </p>
      </footer>
    </div>
  )
}

export default App
