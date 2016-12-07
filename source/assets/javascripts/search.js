import lunr from 'lunr'

class Search {
  constructor() {
    this.index = this.buildIndex()
    this.dataURL = 'https://gettypubs.github.io/ancient-lamps/search.json'
    this.getData()
  }

  buildIndex() {
    return lunr(function() {
      this.field('cat', { boost: 1000 })
      this.field('inv', { boost: 10 })
      this.field('dor_id', { boost: 10 })
      this.field('description')
      this.field('place')
      this.field('provenance')
      this.field('discussion')
      this.field('parallels')
      this.field('discus_iconography')
      this.ref('id')
    })
  }

  getData() {
    $.get(this.dataURL).done((data) => {
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
