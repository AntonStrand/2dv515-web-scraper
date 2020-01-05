# Web scraper

My solution for Web intelligence (2DV515) project at Linnaeus University.

## Requirements

In this project you shall use a web scraping library to download articles that can be used in your search engine from Assignment 3.

When scraping a site such as Wikipedia, you usually start on one page and follow all outgoing links.

You can download pages from Wikipedia or from any other site.

### Grade E

- [x] Scrape and store raw HTML for at least 200 pages

### Grade C-D

- [x] Parse the raw HTML files to generate a dataset similar to the Wikipedia dataset from Assignment 3
- [x] For each article, the dataset shall contain a file with all words in the article and another file with all outgoing links in the article

### Grade A-B

- [x] Use the dataset with your search engine from Assignment 3
- [x] Use both content-based ranking and PageRank to rank search results

## Get started

#### `npm install`

Will install all dependencies for scraper, client and server. It will also scrape 200 wiki articles. Keep in mind that this will take ~1 minute.

#### `npm start`

Will start both client and server.
