/* eslint-disable no-multi-spaces  */

import L from 'leaflet'
import geojsonData from './geojson.js'
import './vendor/leaflet.label-src.js'
import lookupData from './lookup.js'
import _ from 'lodash/core'
import includes from 'lodash.includes'

class Map {
  constructor() {
    this.map = {}
    this.el = 'map'
    this.defaultZoom = 6
    this.maxZoom = 12
    this.minZoom = 5
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
      maxZoom: this.maxZoom,
      minZoom: this.minZoom
    }).setView(this.ctr, this.defaultZoom)
  }

  addTiles() {
    L.tileLayer(this.tiles + this.token, {
      // options
      attribution: this.attr
    }).addTo(this.map)
  }

  addData() {
    // Labels with catalogue entries, regardless of type
    let catalogueLabels = L.geoJson(this.geojsonData, {
      filter: function(feature, layer) { return feature.properties.catalogue.length > 0 },
      pointToLayer: this.addLabels,
      onEachFeature: (feature, layer) => { this.addPopups(feature, layer) }
    })

    // Region labels
    let regionLabels = L.geoJson(this.geojsonData, {
      filter: function(feature, layer) {
        return feature.properties.feature_type === 'region' ||
          feature.properties.feature_type === 'sea' &&
          feature.properties.catalogue.length < 1
      },
      pointToLayer: this.addLabels,
      onEachFeature: (feature, layer) => { this.addPopups(feature, layer) }
    })

    // Sites / points of interest
    let siteLabels = L.geoJson(this.geojsonData, {
      filter: function(feature, layer) {
        return feature.properties.feature_type === 'site' &&
          feature.properties.catalogue.length < 1
      },
      pointToLayer: this.addLabels
    })

    let overlays = {
      'Catalogue Locations': catalogueLabels,
      'Regions': regionLabels,
      'Points of Interest': siteLabels
    }

    let options = {
      collapsed: false,
      position: 'topright'
    }

    this.map.addLayer(catalogueLabels)
    L.control.layers(null, overlays, options).addTo(this.map)
  }

  addLabels(feature, latlng) {
    let catClass = ''
    switch (feature.properties.feature_type) {
      case 'country':
        if (feature.properties.catalogue.length > 0) { catClass = 'has-catalogue' }
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: `map__label__country ${catClass}`,
            iconSize: 150
          })
        })
      case 'region':
      case 'sea':
        if (feature.properties.catalogue.length > 0) { catClass = 'has-catalogue' }
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: `map__label__region ${catClass}`,
            iconSize: 80
          })
        })
      default:
        if (feature.properties.catalogue.length > 0) {
          return L.circleMarker(latlng, {
            radius: 5,
            fillColor: '#328474',
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 1
          }).bindLabel(feature.properties.custom_name, {
            className: 'map__label__site has-catalogue'
          })
        } else {
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
  }

  addPopups(feature, layer) {
    let props         = feature.properties
    let popupOptions  = {minWidth: 100, maxHeight: 250, className: 'map__popup'}
    let popupMsg      = `<h4 class="feature-name">${props.custom_name}</h4>`
    let pleiadesUrl   = `http://pleiades.stoa.org/places/${props.pid}`
    let tgnUrl        = `http://vocab.getty.edu/page/tgn/${props.tgn}`
    let linkedEntries = props.catalogue

    // Build the message string based on the values above.
    if (props.tgn.length > 0) {
      popupMsg += `<a target='blank' href=${tgnUrl}>Getty TGN ID: ${props.tgn}</a><br />`
    }
    if (props.pid.length > 0) {
      popupMsg += `<a target='blank' href=${pleiadesUrl}>Pleiades ID: ${props.pid}</a><br />`
    }
    if (linkedEntries.length > 0) {
      popupMsg += '<strong>Catalogue Entries:</strong><ul>'
      linkedEntries.forEach((entry) => {
        let link = this.linkLookup(entry)
        if (link && link.hasOwnProperty('path')) {
          popupMsg += `<li><a href="../catalogue/${link.path}">Cat. ${entry}</a></li>`
        } else {
          popupMsg += `<li>Cat. ${entry}</li>`
        }
      })
      popupMsg += '</ul>'
    }

    layer.bindPopup(popupMsg, popupOptions)
  }

  linkLookup(catNumber) {
    return _.find(lookupData, function(i) {
      if (typeof i.cat_no === 'number' || typeof i.cat_no === 'string') {
        return i.cat_no === catNumber
      } else {
        return includes(i.cat_no, catNumber)
      }
    })
  }
}

export default Map
