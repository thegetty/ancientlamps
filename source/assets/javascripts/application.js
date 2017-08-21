// =============================================================================
// application.js
// -----------------------------------------------------------------------------
//
// jQuery is presumed to be available globally, but all other dependencies for
// this file should be explicitly required here.
//
import $ from 'jquery'
import UI from './ui.js'
import './vendor/velocity.min.js'
import './vendor/velocity.ui.min.js'
import './vendor/jquery.smoothState.min.js'

require('lazysizes')
import './vendor/ls.attrchange.js'
import './vendor/ls.unveilhooks.js'

import lunr from 'lunr'
import localforage from 'localforage'

// Polyfill the CustomEvent API for Internet Explorer
// -----------------------------------------------------------------------------
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
//
// This application makes use of the Custom Event API to communicate across a
// few mostly-separate parts when needed. A large amount of supporting JSON
// data needs to be stored before the app can function fully. When this data
// is ready for use by other components (details view, search tool, etc),
// an event is broadcast announcing that the relevant data is ready.
//
// Internet Explorer does not implement this API the same as other browsers
// so this polyfill is necessary there.
//
(function () {
  if (typeof window.CustomEvent === 'function') return false

  function CustomEvent (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined }
    var evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }

  CustomEvent.prototype = window.Event.prototype
  window.CustomEvent = CustomEvent
})()

// Setup the Page object
// -----------------------------------------------------------------------------
//
// This singleton object gathers globally-necessary values and methods into one
// namespace ("page").
//
window.page = {
  // Properties
  _catalogueStatus: false,
  _searchStatus: false,
  _platesStatus: false,
  env: 'PRODUCTION', // change to PRODUCTION for deployment
  searchIndex: lunr(function () {
    this.field('title', { boost: 100 })
    this.field('content')
    this.ref('id')
  }),
  ui: {}, // this is a handle for later,
  urls: {
    search: '/search.json',
    catalogue: '/catalogue.json',
    plates: '/plates.json',
    prefix: 'https://www.getty.edu/publications/ancientlamps'
  },

  // Methods
  get catalogueStatus () { return this._catalogueStatus },
  get searchStatus    () { return this._searchStatus },
  get platesStatus    () { return this._platesStatus },

  set catalogueStatus (val) {
    this._catalogueStatus = val
    this.broadcastStatus({ catalogue: val })
  },
  set searchStatus (val) {
    this._searchStatus = val
    this.broadcastStatus({ search: val })
  },
  set platesStatus (val) {
    this._platesStatus = val
    this.broadcastStatus({ plates: val })
  },

  broadcastStatus (status) {
    for (var prop in status) {
      if (status[prop] === true) {
        let event = new window.CustomEvent(prop)
        window.dispatchEvent(event)
      }
    }
  },

  // setupStoredData()
  //
  // asynchronously checks if values are present in localforage; if not,
  // makes AJAX requests to grab the necessary data. Once each value is
  // confirmed to be ready, the broadcastStatus() method is fired so that
  // other components can listen for this change and react accordingly.
  //
  setupStoredData () {
    let searchDataURL, catalogueDataURL, platesDataURL

    if (this.env === 'PRODUCTION') {
      searchDataURL = `${this.urls.prefix}${this.urls.search}`
      catalogueDataURL = `${this.urls.prefix}${this.urls.catalogue}`
      platesDataURL = `${this.urls.prefix}${this.urls.plates}`
    } else {
      searchDataURL = this.urls.search
      catalogueDataURL = this.urls.catalogue
      platesDataURL = this.urls.plates
    }

    localforage.getItem('contents').then((data) => {
      if (data === null) {
        $.get(searchDataURL).done((data) => {
          localforage.setItem('contents', data).then((data) => {
            this.setupSearchIndex(data)
            this.searchStatus = true
          })
        })
      } else {
        this.setupSearchIndex(data)
        this.searchStatus = true
      }
    })

    localforage.getItem('catalogue').then((data) => {
      if (data === null) {
        $.get(catalogueDataURL).done((data) => {
          localforage.setItem('catalogue', data).then((data) => {
            this.catalogueStatus = true
          })
        })
      } else {
        this.catalogueStatus = true
      }
    })

    localforage.getItem('plates').then((data) => {
      if (data === null) {
        $.get(platesDataURL).done((data) => {
          localforage.setItem('plates', data).then((data) => {
            this.platesStatus = true
          })
        })
      } else {
        this.platesStatus = true
      }
    })
  },

  setupSearchIndex (data) {
    data.forEach((item) => { window.page.searchIndex.add(item) })
  }
}

function prepareTransitions () {
  $('#main').smoothState({
    onStart: {
      duration: 400,
      render ($container) {
        if (window.page.ui.menuVisible) { window.page.ui.menuToggle() }
        $container.velocity('fadeOut', { duration: 200 })
      }
    },
    onReady: {
      duration: 400,
      render ($container, $newContent) {
        $container.html($newContent)
        $container.velocity('fadeIn', { duration: 100 })
      }
    },
    onAfter ($container, $newContent) {
      // ui()
      window.page.ui = new UI()
      document.querySelector('body').classList.remove('noscroll')
    }
  })
}

// Start here
window.page.setupStoredData()

$(document).ready(() => {
  window.page.ui = new UI()
  prepareTransitions()
})
