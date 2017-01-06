import _ from 'lodash/core'
import debounce from 'lodash.debounce'
import moment from 'moment'
import L from 'leaflet'
L.tileLayer.deepzoom = require('./leaflet-deepzoom')
import Map from './map.js'
import ImageViewer from './imageviewer.js'
import Search from './search.js'

class UI {
  constructor() {
    this.menuVisible = false
    this.searchVisible = false
    this.deepZoomVisible = false
    this.zoomInstance = {}
    this.searchInstance = null
    this.setup()
  }

  catNumCheck(cat) {
    if (isNaN(Number(cat))) {
      return cat
    } else {
      return Number(cat)
    }
  }

  setup() {
    // Objects of interest
    let $menuButton = $('#navbar-menu')
    let $menuCloseButton = $('#nav-menu-close')
    let $searchButton = $('#navbar-search')
    let $searchCloseButton = $('#search-close')
    let $searchInput = $('.search-field')
    let $expanderContent = $('.expander-content')
    let $triggers = $('.expander-trigger')
    let $curtain = $('.sliding-panel-fade-screen')
    let $thumbnails = $('.cat-entry__grid__item')
    let $detailCloseButton = $('.cat-entry__details__close')
    let $mapEl = $('#map')

    // Run once on startup
    this.citationDate()
    this.anchorScroll(window.location.hash)
    $expanderContent.addClass('expander--hidden')

    // Event Listeners: All pages
    $curtain.click(() => { this.menuToggle() })
    $menuButton.click(() => { this.menuToggle() })
    $menuCloseButton.click(() => { this.menuToggle() })
    $searchButton.click(() => { this.showSearch() })
    $searchCloseButton.click(() => { this.hideSearch() })
    $triggers.click(e => this.expandToggle(e))

    window.onkeydown = (e) => {
      this.keyboardControls(e)
    }

    window.onhashchange = () => {
      if (this.deepZoomVisible) {
        this.hideDetails()
        window.scrollBy(0, -60)
      }
    }

    // This is crazy but trying a more conventional setup fails with debounce
    let debouncedSearch = debounce(this.searchQuery, 50)
    let boundDebounce = debouncedSearch.bind(this)

    $searchInput.keydown(() => {
      boundDebounce()
    })

    // Page-specific elements
    if ($detailCloseButton.length) { $detailCloseButton.click(() => { this.hideDetails() }) }
    if ($thumbnails.length) { $thumbnails.click(e => this.showDetails(e)) }
    if ($mapEl.length) { new Map() }
  }

  citationDate() {
    let today = moment().format('D MMM. YYYY')
    let $currentDate = $('.cite-current-date')
    $currentDate.empty()
    $currentDate.text(today)
  }

  removeHash() {
    if (window.location.hash.length > 0) {
      window.history.pushState('', document.title, window.location.pathname + window.location.search)
    }
  }

  anchorScroll(href) {
    href = typeof (href) === 'string' ? href : $(this).attr('href')
    var fromTop = 60

    if (href.indexOf('#') === 0) {
      var $target = $(href)

      if ($target.length) {
        $('html, body').animate({ scrollTop: $target.offset().top - fromTop })
        // if (window.history && 'pushState' in window.history) {
          // window.history.pushState({}, document.title, window.location.pathname + href)
          // return false
        // }
      }
    }
  }

  keyboardControls(e) {
    let $prev = $('a#prev-link')
    let $next = $('a#next-link')

    switch (e.which) {
      case 27: // Escape key
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        if (this.deepZoomVisible) { this.hideDetails() }
        break
      case 37: // Left Arrow
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        if (this.deepZoomVisible) { this.hideDetails() }
        if ($prev.length) {
          window.location = $prev.attr('href')
        }
        break
      case 39: // Right Arrow
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        if (this.deepZoomVisible) { this.hideDetails() }
        if ($next.length) {
          window.location = $next.attr('href')
        }
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

  // DetailsToggle
  // -----------------------------------------------------------------------------
  // Adds/removes classes for the display of the detail view of selected image.
  //
  showDetails(e) {
    let cat = this.catNumCheck(e.target.dataset.cat)
    let dataURL = 'https://gettypubs.github.io/ancient-lamps/catalogue.json'
    // let dataURL = '/catalogue.json'
    let detailImage = document.querySelector('.cat-entry__details__image')
    let detailData = document.querySelector('.cat-entry__details__data')
    let detailCloseButton = document.querySelector('.cat-entry__details__close')

    this.zoomInstance = new ImageViewer(cat)
    this.zoomInstance.fetchData()

    // toggle classes for display
    detailImage.classList.add('is-visible')
    detailData.classList.add('is-visible')
    detailCloseButton.classList.add('is-visible')
    document.querySelector('body').classList.add('noscroll')
    this.deepZoomVisible = true
    this.removeHash()

    // TODO: move this code into an ObjectDetails class
    // Fetch tombstone data and template
    let template = document.getElementById('entry-template')
    let container = document.getElementById('entry-template-container')
    let clone = document.importNode(template.content, true)

    $.get(dataURL).done((data) => {
      let query = {'cat_no': cat}
      let catData = _.find(data, query)
      console.log(catData)

      // populate template
      clone.getElementById('entry-cat-number').innerHTML = catData.cat_no
      clone.getElementById('entry-inv-number').innerHTML = catData.inv_no
      clone.getElementById('entry-dimensions').innerHTML = catData.dimensions
      clone.getElementById('entry-date').innerHTML = catData.date
      clone.getElementById('entry-condition').innerHTML = catData.condition_and_fabric
      clone.getElementById('entry-type').innerHTML = catData.type
      clone.getElementById('entry-place').innerHTML = catData.place
      clone.getElementById('entry-description').innerHTML = catData.description
      clone.getElementById('entry-parallels').innerHTML = catData.parallels

      // Some sections do not appear for all entries
      if (catData.provenance) {
        clone.querySelector('.section.provenance').classList.remove('is-hidden')
        clone.getElementById('entry-provenance').innerHTML = catData.provenance
      }

      if (catData.discus_iconography) {
        clone.querySelector('.section.iconography').classList.remove('is-hidden')
        clone.getElementById('entry-iconography').innerHTML = catData.discus_iconography
      }

      if (catData.discussion) {
        clone.querySelector('.section.discussion').classList.remove('is-hidden')
        clone.getElementById('entry-discussion').innerHTML = catData.discussion
      }

      if (catData.bibliography) {
        clone.querySelector('.section.bibliography').classList.remove('is-hidden')
        clone.getElementById('entry-bibliography').innerHTML = catData.bibliography
      }

      if (catData.stamp) {
        clone.querySelector('.section.stamp').classList.remove('is-hidden')
        clone.getElementById('entry-stamp').src = `../../assets/images/stamps/${catData.stamp}`
      }

      if (catData.condition) {
        clone.querySelector('.section.condition h2').textContent = 'Condition'
        clone.getElementById('entry-condition').innerHTML = catData.condition
      }
      // Append the new template
      container.appendChild(clone)
    })
  }

  hideDetails() {
    let detailImage = document.querySelector('.cat-entry__details__image')
    let detailData = document.querySelector('.cat-entry__details__data')
    let detailCloseButton = document.querySelector('.cat-entry__details__close')
    let $container = $('#entry-template-container')

    // toggle classes for display
    detailImage.classList.remove('is-visible')
    detailData.classList.remove('is-visible')
    detailCloseButton.classList.remove('is-visible')
    document.querySelector('body').classList.remove('noscroll')
    this.deepZoomVisible = false

    // Remove the old template
    $container.empty()

    // Remove the old map instance
    this.zoomInstance.removeMap()
  }

  showSearch() {
    if (!this.searchVisible) {
      let navbar = document.querySelector('.navbar')
      let searchResults = document.querySelector('.search-results')
      navbar.classList.add('search-active')
      searchResults.classList.add('search-active')
      this.searchVisible = true
    }
  }

  hideSearch() {
    if (this.searchVisible) {
      let navbar = document.querySelector('.navbar')
      let searchResults = document.querySelector('.search-results')
      navbar.classList.remove('search-active')
      searchResults.classList.remove('search-active')
      this.searchVisible = false
    }
  }

  searchQuery() {
    if (!this.searchInstance) { this.searchInstance = new Search() }
    let searchInput = document.querySelector('.search-field')
    let query = searchInput.value
    let container = document.querySelector('.search-results-list')
    let template = document.getElementById('search-results-template')

    container.innerHTML = ''
    let results = this.searchInstance.search(query)

    results.forEach((result) => {
      let clone = document.importNode(template.content, true)
      let resultData = this.searchInstance.contentList[result.ref]
      let resultTitle = clone.querySelector('.search-results-list-item-link')

      if (Array.isArray(resultData.cat) && resultData.cat.length > 1) {
        // Group of cat entries
        let catNumbers = [resultData.cat[0], _.last(resultData.cat)].join('–')
        resultTitle.textContent = `${catNumbers}: ${resultData.title}`
        resultTitle.href = resultData.url
      } else if (typeof resultData.cat === 'number') {
        // Single cat entry
        let catNumber = resultData.cat
        resultTitle.textContent = `${catNumber}: ${resultData.title}`
        resultTitle.href = resultData.url
      } else {
        // No cat entries
        resultTitle.textContent = resultData.title
        resultTitle.href = resultData.url
      }
      container.appendChild(clone)
    })
  }
}

export default UI
