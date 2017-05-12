import L from 'leaflet'
import $ from 'jquery'
import _ from 'lodash/core'
import Vue from 'vue'
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
      platesURL: '/plates.json',
      // platesURL: 'https://gettypubs.github.io/ancient-lamps/plates.json',
      el: 'js-deepzoom',
      maxZoom: 13,
      minZoom: 10,
      faces: [],
      map: ''
    }
  },
  computed: {
    path () {
      return `https://s3-us-west-1.amazonaws.com/gettypubs-lamps/${this.cat}`
    }
  },
  watch: {
    active (newStatus) {
      if (newStatus === true) {
        this.getData()
        this.renderMap()
      } else {
        this.removeMap()
      }
    },
    cat (newCat) {
      this.removeMap()
      this.getData()
      this.renderMap()
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    renderMap () {
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
      let storedPlates = window.localStorage.getItem('plates')
      if (storedPlates) {
        let query = {cat: this.cat}
        let imageData = _.find(JSON.parse(storedPlates), query)
        this.faces = imageData.images
      } else {
        $.get(this.platesURL).done((data) => {
          window.localStorage.setItem('plates', JSON.stringify(data))
          let query = {cat: this.cat}
          let imageData = _.find(data, query)
          this.faces = imageData.images
        })
      }
    },
    removeMap () {
      this.map.remove()
    }
  }
})

export default ImageViewer
