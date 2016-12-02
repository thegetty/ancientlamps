import L from 'leaflet'
import $ from 'jquery'
import _ from 'lodash'
L.tileLayer.deepzoom = require('./leaflet-deepzoom')

class ImageViewer {
  constructor(id) {
    // instance data
    this.cat = this.catNumCheck(id)
    this.faces = []
    this.map = {}

    // config properties - change as needed
    this.path = `https://s3-us-west-1.amazonaws.com/gettypubs-lamps/${this.cat}`
    this.platesURL = 'https://gettypubs.github.io/ancient-lamps/plates.json'
    this.el = 'js-deepzoom'
    this.maxZoom = 13
    this.minZoom = 10

    // this.fetchData()
  }

  fetchData() {
    $.get(this.platesURL).done((data) => {
      let query = {cat: this.cat}
      let imageData = _.find(data, query)
      this.faces = imageData.images
      let layers = {}

      if (imageData) {
        this.map = L.map('js-deepzoom', {
          maxZoom: 13,
          minZoom: 10
        }).setView([0, 0], 13)

        this.faces.forEach((face) => {
          let faceName = face.face
          let facePath = this.path + '/' + faceName + '/'
          layers[faceName + ' view'] = L.tileLayer.deepzoom(facePath, {
            width: face.width,
            height: face.height,
            tolerance: 0.8
          })
        })

        L.control.layers(layers).addTo(this.map).setPosition('topright')
        this.map.addLayer(layers['top view'])
      }
    })
  }

  catNumCheck(cat) {
    if (isNaN(Number(cat))) {
      return cat
    } else {
      return Number(cat)
    }
  }

  // Proxy to the leaflet object's remove() method
  removeMap() {
    this.map.remove()
  }
}

export default ImageViewer
