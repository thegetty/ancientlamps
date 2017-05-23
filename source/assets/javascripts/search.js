import Vue from 'vue'
import _ from 'lodash/core'
import localforage from 'localforage'

let Search = Vue.extend({
  name: 'Search',
  template: '#search-results-template',
  data () {
    return {
      index: '',
      ready: false,
      results: [],
      contents: [],
      query: ''
    }
  },
  mounted () {
    // console.log('Search component mounted')
    this.index = window.page.searchIndex

    if (window.page.searchStatus) {
      this.loadData()
    } else {
      window.addEventListener('search', (e) => {
        this.loadData()
      })
    }
  },
  watch: {
    query (newQuery) {
      this.results = []
      this.results = this.search(newQuery)
    }
  },
  methods: {
    loadData () {
      // TODO: This function is causing the UI to lag when it runs.
      // Figure out how to mitigate this. The contents data is very
      // large (1MB of JSON or more).
      localforage.getItem('contents').then((data) => {
        this.contents = data.map(function (item) {
          return {
            id: item.id,
            title: item.title,
            type: item.type,
            url: item.url
          }
        })
        this.ready = true
        // console.log('Search component data loaded')
      })
    },
    search (query) {
      this.query = query
      return _.map(this.index.search(query), (r) => {
        return this.contents[r.ref]
      })
    }
  }
})

export default Search
