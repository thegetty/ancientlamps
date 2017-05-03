import Vue from 'vue'
import _ from 'lodash/core'
import ImageViewer from './imageviewer.js'

let Details = Vue.extend({
  name: 'Details',
  template: '#cat-entry-template',
  components: {
    'deep-zoom': ImageViewer
  },
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
    catNumCheck (cat) {
      if (isNaN(Number(cat))) {
        return cat
      } else {
        return Number(cat)
      }
    },
    getData () {
      $.get(this.dataURL).done((data) => {
        this.entry = _.find(data, { 'cat_no': this.catNumCheck(this.cat) })
      })
    },
    hide () {
      this.visible = false
      document.querySelector('body').classList.remove('noscroll')
    },
    show () {
      this.visible = true
    }
  }
})

export default Details
