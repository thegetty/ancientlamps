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

let pageUI = {}
// window.search = {}

// PrepareTransitions
// -----------------------------------------------------------------------------
// This function choreographs the SmoothState and Velocity animations between
// page transitions. Make sure to re-initialize things like event-handlers after
// new content has been loaded.
function prepareTransitions () {
  $('#main').smoothState({
    onStart: {
      duration: 400,
      render ($container) {
        if (pageUI.menuVisible) { pageUI.menuToggle() }
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
      pageUI = new UI()
      document.querySelector('body').classList.remove('noscroll')
    }
  })
}

// Document Ready
// -----------------------------------------------------------------------------
// Only call other functions inside of this.
$(document).ready(function() {
  pageUI = new UI()
  prepareTransitions()
})
