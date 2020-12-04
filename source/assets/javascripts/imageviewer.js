import L from 'leaflet'
import _ from 'lodash/core'
import Vue from 'vue'
import localforage from 'localforage'

L.tileLayer.deepzoom = require('./leaflet-deepzoom')

let ImageViewer = Vue.extend({
  name: 'DeepZoom',
  template: `
    <div class="cat-entry__details__image"
      id="js-deepzoom">
    </div> `,
  props: ['cat', 'active'],
  data () {
    return {
      el: 'js-deepzoom',
      maxZoom: 13,
      minZoom: 10,
      faces: [],
      map: null
    }
  },
  computed: {
    path () {
      return `https://www.getty.edu/publications/resources/gettypubs-lamps/${this.cat}`
    }
  },
  watch: {
    active (newStatus) {
      this.renderMap()
    },
    cat (newCat) {
      this.getData()
    }
  },
  mounted () {
    if (window.page.platesStatus) {
      // console.log('PlatesStatus is ' + window.page.platesStatus)
      this.getData()
    } else {
      window.addEventListener('plates', (e) => {
        // console.log('Plates event detected')
        this.getData()
      })
    }
  },
  methods: {
    renderMap () {
      if (this.map) { this.removeMap() }
      if (this.cat === 456) { return false }

      this.map = L.map('js-deepzoom', {
        maxZoom: this.maxZoom,
        minZoom: this.minZoom
      }).setView([0, 0], 13)

      let layers = {}
      this.faces.forEach((face) => {
        let faceName = face.face
        let facePath = this.path + '/' + faceName + '/'
        layers[faceName + ' view'] = L.tileLayer.deepzoom(facePath, {
          width: face.width,
          height: face.height,
          tolerance: 0.8
        })
      })

      L.control.layers(layers).addTo(this.map).setPosition('bottomleft')

      if (layers['main view']) {
        this.map.addLayer(layers['main view'])
      } else if (layers['front view']) {
        this.map.addLayer(layers['front view'])
      } else {
        this.map.addLayer(layers['top view'])
      }
    },
    getData () {
      console.log('getData called. Current cat is: ' + this.cat)
      localforage.getItem('plates').then((data) => {
        if (this.cat === 456) { return false }

        let query = {cat: this.cat}
        let imageData = _.find(data, query)
        this.faces = imageData.images
        this.renderMap()
      })
    },
    removeMap () {
      if (typeof this.map === 'object' && this.map !== null) {
        this.map.remove()
        this.map = null
      }
    }
  }
})

export default ImageViewer
