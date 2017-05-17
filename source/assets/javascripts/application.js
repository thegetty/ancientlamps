// =============================================================================
// application.js
// -----------------------------------------------------------------------------
// This is the main module which serves as the entry point for all JS code in
// the application. Webpack will point to this file and use it to compile a
// dependency graph for all other JS assets during build.
//
// jQuery is presumed to be available globally, but all other dependencies for
// this file should be explicitly required here.

// Dependencies
// -----------------------------------------------------------------------------
import $ from 'jquery'
import UI from './ui.js'
import './vendor/velocity.min.js'
import './vendor/velocity.ui.min.js'
import './vendor/jquery.smoothState.min.js'
import lunr from 'lunr'
import localforage from 'localforage'
import includes from 'lodash.includes'

window.pageUI = {}
window.globalSearchIndex = lunr(function () {
  this.field('title', { boost: 100 })
  // this.field('url')
  this.field('content')
  this.ref('id')
})

function setupStoredData () {
  // let urlPrefix = 'https://gettypubs.github.io/ancient-lamps'

  let searchDataURL = '/search.json'
  // let searchDataURL = `${urlPrefix}/search.json`

  let catalogueDataURL = '/catalogue.json'
  // let catalogueDataURL = `${urlPrefix}/catalogue.json`

  let platesDataURL = '/plates.json'
  // let platesDataURL = `${urlPrefix}/plates.json`

  localforage.keys().then((keys) => {
    // store contents.json for client-side search
    if (includes(keys, 'contents')) {
      localforage.getItem('contents').then((data) => {
        data.forEach((item) => { window.globalSearchIndex.add(item) })
      })
      console.log('Contents data loaded.')
    } else {
      $.get(searchDataURL).done((data) => {
        localforage.setItem('contents', data)
        data.forEach((item) => { window.globalSearchIndex.add(item) })
        console.log('Contents data loaded.')
      })
    }
    // store catalogue.json for details and catalogue components
    if (includes(keys, 'catalogue')) {
      console.log('Catalogue data loaded.')
    } else {
      $.get(catalogueDataURL).done((data) => {
        localforage.setItem('catalogue', data)
        console.log('Catalogue data loaded.')
      })
    }

    // store plates.json for deepzoom component
    if (includes(keys, 'plates')) {
      console.log('Plates data loaded.')
    } else {
      $.get(platesDataURL).done((data) => {
        localforage.setItem('plates', data)
        console.log('Plates data loaded.')
      })
    }
  })
}

function prepareTransitions () {
  $('#main').smoothState({
    onStart: {
      duration: 400,
      render ($container) {
        if (window.pageUI.menuVisible) { window.pageUI.menuToggle() }
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
      window.pageUI = new UI()
      document.querySelector('body').classList.remove('noscroll')
    }
  })
}

// Start here
setupStoredData()

$(document).ready(() => {
  window.pageUI = new UI()
  prepareTransitions()
})
