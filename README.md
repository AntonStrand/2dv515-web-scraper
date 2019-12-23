# Search Engine
My solution for Web intelligence (2DV515) assignment 3 at Linnaeus University.

## Requirements
### Grade E
- [x] Implement a basic search engine that index all pages in the Wikipedia dataset (see Datasets page)
- [x] Search queries shall only contain single words
- [x] Results shall be ranked using the word frequency metric
- [x] The user shall input the search queries in a web client, and display the search results returned from the server
- [x] Display the top 5 search results with page and rank score
- [x] Implement the system using a REST web service where:
  - [x] client sends a request to a server
  - [x] the server responds with json data
  - [x] the json data is decoded and presented in a client GUI

### Grade C-D
- [x] It shall be possible to use search queries of more than one word
- [x] Results shall be ranked using: `score = word_frequency + 0.8 * document_location`
- [x] Display the top 5 search results with page and rank score

### Grade A-B
- [x] Implement the PageRank algorithm and use it to rank the search results
- [x] Run the algorithm for 20 iterations
- [x] Results shall be ranked using: `score = word_frequency + 0.8 * document_location + 0.5 * pagerank`
- [x] Display the top 5 search results with page and rank score

## Get started
#### `npm install`
Will install all dependencies for both client and server.

#### `npm start`
Will start both client and server.
