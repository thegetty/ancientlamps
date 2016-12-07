import lunr from 'lunr'

class Search {
  constructor() {
    this.index = this.buildIndex()
    this.dataURL = 'https://gettypubs.github.io/ancient-lamps/search.json'
    // this.dataURL = '/search.json'
    this.getData()
    this.contentList = []
  }

  buildIndex() {
    return lunr(function() {
      this.field('cat', { boost: 1000 })
      this.field('url')
      this.field('title', { boost: 100 })
      this.field('content')
      this.ref('id')
    })
  }

  getData() {
    $.get(this.dataURL).done((data) => {
      this.contentList = data
      data.forEach((item) => {
        this.index.add(item)
      })
    })
  }

  search(query) {
    return this.index.search(query)
  }
}

export default Search
