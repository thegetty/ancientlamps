import Vue from 'vue'
import _ from 'lodash/core'

let Details = Vue.extend({
  name: 'Details',
  template: '#cat-entry-template',
  data () {
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
    cat (newCat) {
      this.entry = 'Loading'
      this.getData()
    }
  },
  computed: {
    collectionLink () {
      return `http://www.getty.edu/art/collection/objects/${this.entry.dor_id}`
    },
    stamp () {
      if (this.entry.stamp) {
        return `../../assets/images/stamps/${this.entry.stamp}`
      } else {
        return null
      }
    }
  },
  mounted () {
    this.getData()
    console.log('Mounted!')
  },
  methods: {
    getData () {
      $.get(this.dataURL).done((data) => {
        this.entry = _.find(data, { 'cat_no': this.cat })
      })
    },
    hide () {
      this.visible = false
    },
    show () {
      this.visible = true
    }
  }
})

export default Details
