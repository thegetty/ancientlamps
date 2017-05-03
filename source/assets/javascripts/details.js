import Vue from 'vue'
import _ from 'lodash/core'

let Details = Vue.extend({
  name: 'Details',
  template: '#cat-entry-template',
  data: function() {
    return {
      cat: '',
      dataURL: '/catalogue.json',
      // dataURL: 'https://gettypubs.github.io/ancient-lamps/catalogue.json'
      entry: 'Loading',
      visible: false
    }
  },
  watch: {
    // Watch the cat number for changes
    cat: function(newCat) {
      this.entry = 'Loading'
      this.getData()
    }
  },
  computed: {
    collectionLink: function() {
      return `http://www.getty.edu/art/collection/objects/${this.entry.dor_id}`
    },
    stamp: function() {
      if (this.entry.stamp) {
        return `../../assets/images/stamps/${this.entry.stamp}`
      } else {
        return null
      }
    }
  },
  mounted: function() {
    this.getData()
    console.log('Mounted!')
  },
  methods: {
    getData: function() {
      $.get(this.dataURL).done((data) => {
        this.entry = _.find(data, { 'cat_no': this.cat })
      })
    }
  }
})

export default Details
