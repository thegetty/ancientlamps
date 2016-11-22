// var _ = require('underscore')
var moment = require('moment')
var L = require('leaflet')
L.tileLayer.deepzoom = require('./leaflet-deepzoom')

class UI {
  constructor() {
    this.menuVisible = false
    this.searchVisible = false
    this.setup()
  }

  setup() {
    // Objects of interest
    let menuButton = document.querySelector('#navbar-menu')
    let expanderContent = document.querySelectorAll('.expander-content')
    let expanderTriggers = document.querySelectorAll('.expander-trigger')

    // Setup
    this.citationDate()
    expanderContent.forEach(function(expander) {
      expander.classList.add('expander--hidden')
    })

    // Listeners
    window.addEventListener('keydown', e => this.keyboardControls(e))
    menuButton.addEventListener('click', () => this.menuToggle())
    expanderTriggers.forEach(trigger => {
      trigger.addEventListener('click', e => this.expandToggle(e))
    })
  }

  citationDate() {
    let today = moment().format('D MMM. YYYY')
    let currentDate = document.querySelectorAll('.cite-current-date')
    currentDate.forEach(function(el) {
      el.innerHTML = ''
      el.textContent = today
    })
  }

  keyboardControls(e) {
    let prev = document.querySelector('#prev-link')
    let next = document.querySelector('#next-link')
    if (this.menuVisible) { this.menuToggle() }
    switch (e.which) {
      case 27: // escape key
        if (this.menuVisible) { this.menuToggle() }
        e.preventDefault()
        break
      case 37: // left arrow
        if (prev) { prev.click() }
        e.preventDefault()
        break
      case 39: // right arrow
        if (next) { next.click() }
        e.preventDefault()
        break
    }
  }

  // TODO: Add CSS transitions to these elements to replace what JQ was doing
  expandToggle(e) {
    let el = e.currentTarget
    let targetSection = el.parentNode.querySelector('.expander-content')
    let hideClass = 'expander--hidden'

    if (targetSection.classList.contains(hideClass)) {
      targetSection.classList.remove(hideClass)
    } else {
      targetSection.classList.add(hideClass)
    }
  }

  menuToggle() {
    let sidebar = document.querySelector('.nav-sidebar')
    let curtain = document.querySelector('.sliding-panel-fade-screen')

    curtain.addEventListener('click', function() {
      sidebar.classList.remove('is-visible')
      curtain.classList.remove('is-visible')
    })

    if (this.menuVisible) {
      sidebar.classList.remove('is-visible')
      curtain.classList.remove('is-visible')
    } else {
      sidebar.classList.add('is-visible')
      curtain.classList.add('is-visible')
    }

    this.menuVisible = !(this.menuVisible)
  }
}

export default UI
