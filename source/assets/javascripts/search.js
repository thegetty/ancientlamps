import Vue from 'vue'
import _ from 'lodash/core'

let Search = Vue.extend({
  name: 'Search',
  template: '#search-results-template',
  data () {
    return {
      index: '',
      results: [],
      contents: [],
      ready: false,
      query: ''
    }
  },
  mounted () {
    // Using previously stashed global valuse for search data for now,
    // since re-creating this after each page transition negatively impacts
    // performance and the data itself will never change.
    this.index = window.globalSearchIndex
    this.contents = window.globalStoredContents
    this.ready = true
  },
  watch: {
    query (newQuery) {
      this.results = []
      this.results = this.search(newQuery)
    }
  },
  methods: {
    search (query) {
      this.query = query
      return _.map(this.index.search(query), (r) => {
        return window.globalStoredContents[r.ref]
      })
    }
  }
})

export default Search
