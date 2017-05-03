import Vue from 'vue'
import _ from 'lodash/core'
import lunr from 'lunr'

let Search = Vue.extend({
  name: 'Search',
  template: '#search-results-template',
  data () {
    return {
      dataURL: '/search.json',
      // dataURL: 'https://gettypubs.github.io/ancient-lamps/search.json'
      index: this.buildIndex(),
      results: [],
      query: ''
    }
  },
  created () {
    console.log('Search created!')
  },
  mounted () {
    this.getData()
  },
  watch: {
    query (newQuery) {
      this.results = []
      this.results = this.search(newQuery)
    }
  },
  methods: {
    buildIndex () {
      return lunr(function () {
        this.field('cat', { boost: 1000 })
        this.field('url')
        this.field('title', { boost: 10 })
        this.field('content')
        this.ref('id')
      })
    },
    addItemToIndex (item) {
      this.index.add(item)
    },
    getData () {
      let storedContents = window.localStorage.getItem('contents')
      if (storedContents) {
        JSON.parse(storedContents).forEach((item) => { this.addItemToIndex(item) })
      } else {
        $.get(this.dataURL).done((data) => {
          data.forEach((item) => { this.addItemToIndex(item) })
          window.localStorage.setItem('contents', JSON.stringify(data))
        })
      }
    },
    search (query) {
      this.query = query
      let contents = JSON.parse(window.localStorage.getItem('contents'))
      return _.map(this.index.search(query), (r) => {
        return contents[r.ref]
      })
    }
  }
})

export default Search
