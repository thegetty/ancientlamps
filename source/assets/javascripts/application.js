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

// These values are assigned globally to avoid performance lags from making
// multiple redundant $.get() or JSON.parse() calls; better to do once and
// persist this data in memory between page transitions.
//
window.pageUI = {}
window.globalStoredContents = []
window.globalSearchIndex = lunr(function () {
  this.field('title', { boost: 100 })
  // this.field('url')
  this.field('content')
  this.ref('id')
})

function globalSearchSetup () {
  console.log('globalSearchSetup() called')
  let searchDataURL = '/search.json'
  // let searchDataURL = 'https://gettypubs.github.io/ancient-lamps/search.json'
  let storedContents = window.localStorage.getItem('contents')

  if (storedContents) {
    console.log('Reading contents from LocaStorage, parsing json...')
    window.globalStoredContents = JSON.parse(storedContents)
    console.log('Adding contents to global search index')
    window.globalStoredContents.forEach((item) => { window.globalSearchIndex.add(item) })
  } else {
    console.log('Loading remote contents JSON via ajax')
    $.get(searchDataURL).done((data) => {
      console.log('Done loading contents')
      window.globalStoredContents = data
      console.log('Adding contents to index')
      data.forEach((item) => { window.globalSearchIndex.add(item) })
      console.log('Saving contents to local storage for future visits')
      window.localStorage.setItem('contents', JSON.stringify(data))
    })
  }
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

globalSearchSetup()
$(document).ready(() => {
  window.pageUI = new UI()
  prepareTransitions()
})
