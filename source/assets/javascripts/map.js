import L from 'leaflet'
import geojsonData from './geojson.js'
import './vendor/leaflet.label-src.js'

class Map {
  constructor() {
    this.map = {}
    this.el = 'map'
    this.defaultZoom = 6
    this.maxZoom = 12
    this.ctr = [40.51379915504413, 17.193603515625]
    this.tiles = 'https://api.mapbox.com/v4/isawnyu.map-knmctlkh/{z}/{x}/{y}.png?access_token='
    this.token = 'pk.eyJ1IjoiZWdhcmRuZXIiLCJhIjoiN2IyMmRlMTc0YTAwMzRjYWVhMzI5ZGY1YmViMGVkZTEifQ._576KIFjJ0S_dRHcdM2BmQ'
    this.attr = `Tiles © <a href="http://mapbox.com/" target="_blank">MapBox</a>
                 | Tiles and Data © 2013 <a href="http://www.awmc.unc.edu" target="_blank">AWMC</a>
                 <a href="http://creativecommons.org/licenses/by-nc/3.0/deed.en_US" target="_blank">CC-BY-NC 3.0</a>`
    this.geojsonData = geojsonData

    this.setup()
    this.addTiles()
    this.addData()
  }

  setup() {
    this.map = L.map(this.el, {
      // options
      maxzoom: this.maxZoom
    }).setView(this.ctr, this.defaultZoom)
  }

  addTiles() {
    L.tileLayer(this.tiles + this.token, {
      // options
      attribution: this.attr
    }).addTo(this.map)
  }

  addData() {
    let regionLabels = L.geoJson(this.geojsonData, {
      filter: function(feature, layer) {
        return feature.properties.feature_type === 'region' ||
          feature.properties.feature_type === 'sea'
      },
      pointToLayer: this.addLabels,
      onEachFeature: this.addPopups
    })

    let countryLabels = L.geoJson(this.geojsonData, {
      filter: function(feature, layer) {
        return feature.properties.feature_type === 'country'
      },
      pointToLayer: this.addLabels,
      onEachFeature: this.addPopups
    })

    let siteLabels = L.geoJson(this.geojsonData, {
      filter: function(feature, layer) {
        return feature.properties.feature_type === 'site'
      },
      pointToLayer: this.addLabels
    })

    let overlays = {
      'Points of Interest': siteLabels
    }

    this.map.addLayer(regionLabels)
    this.map.addLayer(countryLabels)

    L.control.layers(null, overlays, {
      collapsed: false,
      position: 'topright'
    }).addTo(this.map)
  }

  addLabels(feature, latlng) {
    switch (feature.properties.feature_type) {
      case 'country':
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: 'map__label__country',
            iconSize: 150
          })
        })
      case 'region':
      case 'sea':
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: 'map__label__region',
            iconSize: 80
          })
        })
      default:
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: '#333',
          color: '#000',
          weight: 0,
          opacity: 1,
          fillOpacity: 0.75
        }).bindLabel(feature.properties.custom_name, {
          className: 'map__label__site'
        })
    }
  }

  addPopups(feature, layer) {
    let props = feature.properties
    let popupOptions = {
      minWidth: 100,
      maxHeight: 250,
      className: 'map__popup'
    }

    let popupMsg = `<h4 class="feature-name">${props.custom_name}</h4>`
    let pleiadesUrl = `http://pleiades.stoa.org/places/${props.pid}`
    let tgnUrl = `http://vocab.getty.edu/page/tgn/${props.tgn}`
    let linkedEntries = props.catalogue

    if (props.tgn.length > 0) {
      popupMsg += `<a target='blank' href=${tgnUrl}>Getty TGN ID: ${props.tgn}</a><br />`
    }
    if (props.pid.length > 0) {
      popupMsg += `<a target='blank' href=${pleiadesUrl}>Pleiades ID: ${props.pid}</a><br />`
    }
    if (linkedEntries.length > 0) {
      popupMsg += '<strong>Catalogue Entries:</strong><ul>'
      linkedEntries.forEach(function(entry) { popupMsg += `<li>Cat. ${entry}</li>` })
      popupMsg += '</ul>'
    }

    layer.bindPopup(popupMsg, popupOptions)
  }
}

export default Map
