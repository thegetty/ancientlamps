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
var ui = require('./ui.js')

// PrepareTransitions
// -----------------------------------------------------------------------------
// This function choreographs the SmoothState and Velocity animations between
// page transitions. Make sure to re-initialize things like event-handlers after
// new content has been loaded.
function prepareTransitions() {
  $('#main').smoothState({
    onStart: {
      duration: 400,
      render: function($container) {
        $container.velocity('fadeOut', { duration: 200 })
      }
    },
    onReady: {
      duration: 400,
      render: function($container, $newContent) {
        $container.html($newContent)
        $container.velocity('fadeIn', { duration: 100 })
      }
    },
    onAfter: function($container, $newContent) {
      ui()
    }
  })
}

// Document Ready
// -----------------------------------------------------------------------------
// Only call other functions inside of this.
$(document).ready(function() {
  ui()
  prepareTransitions()
})