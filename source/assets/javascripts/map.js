/* eslint-disable no-multi-spaces  */

import L from 'leaflet'
import geojsonData from './geojson.js'
import './vendor/leaflet.label-src.js'
import lookupData from './lookup.js'
import _ from 'lodash/core'
import includes from 'lodash.includes'

require('leaflet.markercluster')

class Map {
  constructor () {
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

    // Handle location hash, if any
    if (window.location.hash.slice(1, 4) === 'loc') { this.zoomToHash() }
  }

  setup () {
    this.map = L.map(this.el, {
      maxZoom: this.maxZoom,
      minZoom: this.minZoom
    }).setView(this.ctr, this.defaultZoom)
  }

  addTiles () {
    L.tileLayer(this.tiles + this.token, {
      attribution: this.attr
    }).addTo(this.map)
  }

  addData () {
    let countryLabels = L.geoJson(this.geojsonData, {
      filter: function (feature, layer) {
        return feature.properties.feature_type === 'country' ||
        feature.properties.feature_type === 'sea'
      },
      pointToLayer: this.addLabels,
      onEachFeature: (feature, layer) => { this.addPopups(feature, layer) }
    })

    // Region labels
    let regionLabels = L.geoJson(this.geojsonData, {
      filter: function (feature, layer) {
        return feature.properties.feature_type === 'region' ||
          feature.properties.feature_type === 'river'
      },
      pointToLayer: this.addLabels,
      onEachFeature: (feature, layer) => { this.addPopups(feature, layer) }
    })

    // Sites / points of interest
    let siteLabels = L.geoJson(this.geojsonData, {
      filter: function (feature, layer) {
        return feature.properties.feature_type === 'site'
      },
      pointToLayer: this.addLabels,
      onEachFeature: (feature, layer) => { this.addPopups(feature, layer) }
    })

    let regionGroup = L.markerClusterGroup()
    regionGroup.addLayer(regionLabels)

    let overlays = {
      // 'Countries': countryLabels,
      'Regions': regionGroup,
      'Points of Interest': siteLabels
    }

    let options = {
      collapsed: false,
      position: 'topright'
    }

    this.map.addLayer(countryLabels)
    this.map.addLayer(regionGroup)
    L.control.layers(null, overlays, options).addTo(this.map)
  }

  addLabels (feature, latlng) {
    switch (feature.properties.feature_type) {
      case 'country':
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: 'map__label__country',
            iconSize: 150
          })
        })
      case 'river':
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: 'map__label__river',
            iconSize: 80
          })
        })
      case 'sea':
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: 'map__label__sea',
            iconSize: 80
          })
        })
      case 'region':
        return L.marker(latlng, {
          icon: L.divIcon({
            html: `<p>${feature.properties.custom_name}</p>`,
            className: `map__label__region`,
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

  addPopups (feature, layer) {
    let options = {minWidth: 100, maxHeight: 250, className: 'map__popup'}
    let message = this.buildPopupMessage(feature)

    layer.bindPopup(message, options)
  }

  addOpenPopup (feature, layer) {
    let latlng = layer.getLatLng()
    let options = {minWidth: 100, maxHeight: 250, className: 'map__popup'}
    let message = this.buildPopupMessage(feature)

    L.popup().setLatLng(latlng).setContent(message).openOn(this.map)
    layer.bindPopup(message, options)
  }

  buildPopupMessage (feature) {
    let props = feature.properties
    let message = `<h4 class="feature-name">${props.custom_name}</h4>`
    let pleiadesUrl = `http://pleiades.stoa.org/places/${props.pid}`
    let tgnUrl = `http://vocab.getty.edu/page/tgn/${props.tgn}`
    let linkedEntries = props.catalogue

    // Build out the message HTML string

    if (props.tgn.length > 0) { message += `<a target='blank' href=${tgnUrl}>Getty TGN ID: ${props.tgn}</a><br />` }
    if (props.pid.length > 0) { message += `<a target='blank' href=${pleiadesUrl}>Pleiades ID: ${props.pid}</a><br />` }

    if (linkedEntries.length > 0) {
      message += '<strong>Catalogue Entries:</strong><ul>'
      linkedEntries.forEach((entry) => {
        let link = this.linkLookup(entry)

        if (link && link.hasOwnProperty('path')) {
          message += `<li><a href="../catalogue/${link.path}/#${entry}">Cat. ${entry}</a></li>`
        } else {
          message += `<li>Cat. ${entry}</li>`
        }
      })
      message += '</ul>'
    }

    return message
  }

  linkLookup (catNumber) {
    return _.find(lookupData, function (i) {
      if (typeof i.cat_no === 'number' || typeof i.cat_no === 'string') {
        return i.cat_no === catNumber
      } else {
        return includes(i.cat_no, catNumber)
      }
    })
  }

  zoomToHash () {
    if (!window.location.hash) {
      return false
    } else {
      let loc = _.find(this.geojsonData.features, function (feature) {
        if (feature.properties.pid.length > 0) {
          // If location has a Pleiades ID
          return feature.properties.pid === window.location.hash.slice(5)
        } else {
          // If location has a TGN ID
          return feature.properties.tgn === window.location.hash.slice(5)
        }
      })
      let coords = [loc.geometry.coordinates[1], loc.geometry.coordinates[0]]
      L.geoJson(loc, {
        pointToLayer: this.addLabels,
        onEachFeature: (feature, layer) => { this.addOpenPopup(feature, layer) }
      }).addTo(this.map)

      $('html, body').animate({ scrollTop: 0 })
      this.map.setView(coords)
    }
  }
}

export default Map
