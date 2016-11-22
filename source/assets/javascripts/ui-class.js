var _ = require('underscore')
var moment = require('moment')
var L = require('leaflet')
L.tileLayer.deepzoom = require('./leaflet-deepzoom')

class UI {
  constructor() {
    window.addEventListener('keydown', e => this.keyboardNav(e))
  }

  keyboardNav(e) {
    var prev, next
    prev = document.getElementById('prev-link')
    next = document.getElementById('next-link')

    if (e.which === 37 && prev) { // 37 = left arrow
      prev.click()
      e.preventDefault()
    } else if (e.which === 39 && next) { // 39 = right arrow
      next.click()
      e.preventDefault()
    }
  }
}

export default UI
