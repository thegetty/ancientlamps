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
    let triggers = document.querySelectorAll('.expander-trigger')
    let curtain = document.querySelector('.sliding-panel-fade-screen')

    // Setup
    this.citationDate()
    expanderContent.forEach(function(expander) {
      expander.classList.add('expander--hidden')
    })

    // Listeners
    curtain.onclick = () => this.menuToggle()
    document.onkeydown = (e) => this.keyboardControls(e)
    menuButton.onclick = () => this.menuToggle()
    triggers.forEach(trigger => {
      trigger.onclick = (e) => this.expandToggle(e)
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
    switch (e.key) {
      case 'Escape':
        if (this.menuVisible) { this.menuToggle() }
        e.preventDefault()
        break
      case 'ArrowLeft':
        if (prev) { prev.click() }
        if (this.menuVisible) { this.menuToggle() }
        e.preventDefault()
        break
      case 'ArrowRight':
        if (next) { next.click() }
        if (this.menuVisible) { this.menuToggle() }
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
