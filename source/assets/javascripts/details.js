import Vue from 'vue'
import _ from 'lodash/core'
import ImageViewer from './imageviewer.js'
import localforage from 'localforage'

let Details = Vue.extend({
  name: 'Details',
  template: '#cat-entry-template',
  components: {
    'deep-zoom': ImageViewer
  },
  data () {
    return {
      cat: '',
      entry: '',
      visible: false
    }
  },
  watch: {
    // Watch the cat number for changes
    cat (newCat) {
      this.findEntry()
    },
    visible (newStatus) {
      if (!this.entry) {
        this.findEntry()
      }
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
    if (window.page.catalogueStatus) {
      this.findEntry()
    } else {
      window.addEventListener('catalogue', (e) => {
        this.findEntry()
      })
    }
  },
  methods: {
    catNumCheck (cat) {
      if (isNaN(Number(cat))) {
        return cat
      } else {
        return Number(cat)
      }
    },
    findEntry () {
      localforage.getItem('catalogue').then((data) => {
        this.entry = _.find(data, { 'cat_no': this.catNumCheck(this.cat) })
      }).catch(function (error) {
        console.log(error)
      })
    },
    hide () {
      let scrollPos = window.scrollY
      this.visible = false
      document.querySelector('body').classList.remove('noscroll')
      window.location.hash = ''
      window.scrollTo(0, scrollPos)
    },
    show () {
      this.visible = true
    }
  }
})

export default Details
